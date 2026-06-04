import { router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../src/services/supabase/auth";

// Native-only imports — skipped on web
let SkiaCanvas, Path, Skia, Gesture, GestureDetector;
if (Platform.OS !== "web") {
  const skia = require("@shopify/react-native-skia");
  SkiaCanvas = skia.Canvas;
  Path       = skia.Path;
  Skia       = skia.Skia;
  const gh   = require("react-native-gesture-handler");
  Gesture         = gh.Gesture;
  GestureDetector = gh.GestureDetector;
}

const ROSE    = "#E8779A";
const BG      = "#0F0C12";
const SURFACE = "#1A1620";
const BORDER  = "#2A2232";
const MUTED   = "#7A6880";
const TEXT    = "#F0EAF5";

const COLORS = ["#1A1420", "#E8779A", "#7C6AFB", "#4ECDC4", "#F7B731", "#FFFFFF"];
const SIZES  = [2, 5, 11];

// ─────────────────────────────────────────────
// Web canvas component (plain HTML canvas)
// ─────────────────────────────────────────────
function WebCanvas({ strokes, color, strokeWidth, isEraser }) {
  const canvasRef    = useRef(null);
  const isDrawing    = useRef(false);
  const currentPts   = useRef([]);
  const lastStrokeCount = useRef(0);

  const activeColor = isEraser ? "#F5F0FF" : color;
  const activeWidth = strokeWidth * (isEraser ? 2.5 : 1);

  // Redraw all strokes whenever strokes array changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#F5F0FF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(({ points, color, width }) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = width;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    });

    lastStrokeCount.current = strokes.length;
  }, [strokes]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const onStart = (e) => {
    e.preventDefault();
    isDrawing.current  = true;
    currentPts.current = [getPos(e)];
  };

  const onMove = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const pts = currentPts.current;
    const last = pts[pts.length - 1];
    const dx = pos.x - last.x;
    const dy = pos.y - last.y;
    if (dx * dx + dy * dy < 4) return;

    currentPts.current = [...pts, pos];

    // Draw incremental segment for live preview
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = activeColor;
    ctx.lineWidth   = activeWidth;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const onEnd = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const pts = currentPts.current;
    if (pts.length > 1) {
      // Bubble completed stroke up
      canvasRef.current.dispatchEvent(
        new CustomEvent("strokecomplete", {
          detail: { points: pts, color: activeColor, width: activeWidth },
          bubbles: true,
        })
      );
    }
    currentPts.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth - 24}
      height={window.innerHeight - 80}
      style={{
        display: "block",
        background: "#F5F0FF",
        borderRadius: 16,
        touchAction: "none",
        cursor: isEraser ? "cell" : "crosshair",
      }}
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    />
  );
}

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────
export default function CanvasScreen() {
  const insets    = useSafeAreaInsets();
  const { id }    = useLocalSearchParams();
  const isWeb     = Platform.OS === "web";

  const [drawing, setDrawing]         = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner]         = useState(false);

  const [strokes, setStrokes]           = useState([]);
  const [activePoints, setActivePoints] = useState([]);
  const [color, setColor]               = useState(COLORS[0]);
  const [sizeIdx, setSizeIdx]           = useState(1);
  const [isEraser, setIsEraser]         = useState(false);
  const [showColors, setShowColors]     = useState(false);

  const activePointsRef = useRef([]);
  const webCanvasWrap   = useRef(null);
  const strokeWidth     = SIZES[sizeIdx];
  const activeColor     = isEraser ? "#F5F0FF" : color;

  // ── Load drawing ────────────────────────
  useEffect(() => {
    if (!id) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      supabase
        .from("drawings")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error) { console.error(error); return; }
          setDrawing(data);
          setIsOwner(user?.id === data.owner_id);
        });
    });
  }, [id]);

  // ── Listen for web stroke events ────────
  useEffect(() => {
    if (!isWeb) return;
    const wrap = webCanvasWrap.current;
    if (!wrap) return;
    const handler = (e) => {
      const { points, color, width } = e.detail;
      setStrokes((s) => [...s, { points, color, width }]);
    };
    wrap.addEventListener("strokecomplete", handler);
    return () => wrap.removeEventListener("strokecomplete", handler);
  }, [isWeb]);

  // ── Delete ──────────────────────────────
  const handleDelete = () => {
    const doDelete = () => {
      supabase
        .from("drawings")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) { console.error(error); return; }
          router.replace("/");
        });
    };
    if (isWeb) {
      if (window.confirm("Delete this drawing? This cannot be undone.")) doDelete();
    } else {
      Alert.alert("Delete drawing", "This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  // ── Skia path builder (native only) ────
  const buildPath = useCallback((points) => {
    if (!Skia) return null;
    const path = Skia.Path.Make();
    if (points.length === 0) return path;
    path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      if (i === 1) {
        path.lineTo(points[i].x, points[i].y);
      } else {
        const prev = points[i - 1];
        const curr = points[i];
        path.quadTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
      }
    }
    return path;
  }, []);

  const undo = useCallback(() => setStrokes((s) => s.slice(0, -1)), []);

  // ── Native gesture (Skia) ───────────────
  const nativeGesture = !isWeb && Gesture
    ? Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .onBegin((e) => {
          activePointsRef.current = [{ x: e.x, y: e.y }];
          setActivePoints([{ x: e.x, y: e.y }]);
          setShowColors(false);
        })
        .onUpdate((e) => {
          const pts  = activePointsRef.current;
          const last = pts[pts.length - 1];
          const dx   = e.x - last.x;
          const dy   = e.y - last.y;
          if (dx * dx + dy * dy < 4) return;
          const next = [...pts, { x: e.x, y: e.y }];
          activePointsRef.current = next;
          setActivePoints(next);
        })
        .onEnd(() => {
          const pts = activePointsRef.current;
          if (pts.length > 1) {
            setStrokes((s) => [
              ...s,
              { points: pts, color: activeColor, width: strokeWidth * (isEraser ? 2.5 : 1) },
            ]);
          }
          activePointsRef.current = [];
          setActivePoints([]);
        })
    : null;

  const topPad = isWeb ? 16 : insets.top + 8;

  const toolbar = (
    <View style={[styles.toolbar, { top: topPad }]}>
      <Pressable
        style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}
        onPress={() => router.back()}
      >
        <Text style={styles.toolIcon}>←</Text>
      </Pressable>

      <Text style={styles.drawingName} numberOfLines={1}>
        {drawing?.name ?? "Loading…"}
      </Text>

      <View style={{ flex: 1 }} />

      {isOwner && (
        <Pressable
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.toolBtnPressed]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      )}

      <View style={styles.toolDivider} />

      <Pressable
        style={[styles.colorBtn, { backgroundColor: color }]}
        onPress={() => { setShowColors((v) => !v); setIsEraser(false); }}
      />

      <Pressable style={styles.toolBtn} onPress={() => setSizeIdx((i) => (i + 1) % SIZES.length)}>
        <View style={[styles.sizeDot, {
          width: strokeWidth + 6,
          height: strokeWidth + 6,
          backgroundColor: isEraser ? "#888" : color,
        }]} />
      </Pressable>

      <Pressable
        style={[styles.toolBtn, isEraser && styles.toolBtnActive]}
        onPress={() => setIsEraser((v) => !v)}
      >
        <Text style={[styles.toolIcon, isEraser && styles.toolIconActive]}>◻</Text>
      </Pressable>

      <View style={styles.toolDivider} />

      <Pressable
        style={[styles.toolBtn, strokes.length === 0 && styles.toolBtnDisabled]}
        onPress={undo}
        disabled={strokes.length === 0}
      >
        <Text style={[styles.toolIcon, strokes.length === 0 && styles.toolIconDim]}>↩</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.root, { paddingBottom: isWeb ? 0 : insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {toolbar}

      {showColors && (
        <View style={[styles.colorPopover, { top: topPad + 54, right: 16 }]}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                c === color && styles.colorSwatchActive,
                c === "#FFFFFF" && styles.colorSwatchWhite,
              ]}
              onPress={() => { setColor(c); setShowColors(false); }}
            />
          ))}
        </View>
      )}

      {/* ── Web canvas ── */}
      {isWeb && (
        <View
          ref={webCanvasWrap}
          style={[styles.canvasWrap, { top: topPad + 54 }]}
        >
          <WebCanvas
            strokes={strokes}
            color={color}
            strokeWidth={strokeWidth}
            isEraser={isEraser}
          />
        </View>
      )}

      {/* ── Native Skia canvas ── */}
      {!isWeb && nativeGesture && (
        <GestureDetector gesture={nativeGesture}>
          <View style={[styles.canvasWrap, { top: topPad + 54 }]}>
            <SkiaCanvas style={StyleSheet.absoluteFill}>
              {strokes.map((s, i) => (
                <Path
                  key={i}
                  path={buildPath(s.points)}
                  color={s.color}
                  style="stroke"
                  strokeWidth={s.width}
                  strokeCap="round"
                  strokeJoin="round"
                />
              ))}
              {activePoints.length > 1 && (
                <Path
                  path={buildPath(activePoints)}
                  color={activeColor}
                  style="stroke"
                  strokeWidth={strokeWidth * (isEraser ? 2.5 : 1)}
                  strokeCap="round"
                  strokeJoin="round"
                />
              )}
            </SkiaCanvas>
          </View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  canvasWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#F5F0FF",
    borderRadius: 16,
    overflow: "hidden",
  },
  toolbar: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
    ...Platform.select({
      web: { boxShadow: "0 4px 24px rgba(0,0,0,0.4)" },
      default: { elevation: 8 },
    }),
  },
  toolBtn:         { width: 36, height: 36, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  toolBtnPressed:  { opacity: 0.5 },
  toolBtnActive:   { backgroundColor: "#E8779A22" },
  toolBtnDisabled: { opacity: 0.25 },
  toolIcon:        { fontSize: 17, color: "#9988AA" },
  toolIconActive:  { color: ROSE },
  toolIconDim:     { color: "#4A3F55" },
  toolDivider:     { width: 1, height: 20, backgroundColor: BORDER, marginHorizontal: 4 },
  drawingName:     { fontSize: 13, fontWeight: "600", color: TEXT, marginLeft: 4, maxWidth: 120 },
  deleteBtn:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "#5C2020", backgroundColor: "#2A1010", marginRight: 2 },
  deleteBtnText:   { fontSize: 12, color: "#FF6B6B", fontWeight: "600" },
  colorBtn:        { width: 24, height: 24, borderRadius: 12, marginHorizontal: 6, borderWidth: 2, borderColor: "#3A3045" },
  sizeDot:         { borderRadius: 99 },
  colorPopover: {
    position: "absolute",
    zIndex: 20,
    flexDirection: "row",
    gap: 8,
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    ...Platform.select({
      web: { boxShadow: "0 4px 20px rgba(0,0,0,0.4)" },
      default: { elevation: 8 },
    }),
  },
  colorSwatch:       { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: "transparent" },
  colorSwatchActive: { borderColor: "#fff", transform: [{ scale: 1.15 }] },
  colorSwatchWhite:  { borderColor: "#3A3045" },
});