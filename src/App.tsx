import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { useState, useCallback } from "react";
import { Id } from "../convex/_generated/dataModel";

// Pixel type for TypeScript
interface Pixel {
  _id: Id<"pixels">;
  _creationTime: number;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  linkUrl?: string;
  title: string;
  userId: Id<"users">;
  purchasedAt: number;
  priceInCents: number;
}

// Auth component
function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-yellow-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-amber-100 mb-2 drop-shadow-lg">
            The Million Barry Page
          </h1>
          <p className="text-amber-200/80 font-body text-lg">
            To me, to you... to the pixels!
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-amber-950/60 backdrop-blur-xl border-2 border-amber-400/30 rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <h2 className="font-display text-2xl text-amber-100 mb-6 text-center">
            {flow === "signIn" ? "Welcome Back!" : "Join the Fun!"}
          </h2>

          {error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 bg-amber-900/40 border border-amber-500/30 rounded-xl text-amber-50 placeholder-amber-400/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-amber-900/40 border border-amber-500/30 rounded-xl text-amber-50 placeholder-amber-400/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
            <input name="flow" type="hidden" value={flow} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-display text-lg rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg"
          >
            {loading ? "Loading..." : flow === "signIn" ? "Sign In" : "Sign Up"}
          </button>

          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="w-full mt-3 py-2 text-amber-300/80 hover:text-amber-200 transition-colors text-sm"
          >
            {flow === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-500/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-amber-950/60 text-amber-400/60">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn("anonymous")}
            className="w-full py-3 border-2 border-dashed border-amber-500/40 text-amber-300 rounded-xl hover:border-amber-400 hover:bg-amber-500/10 transition-all"
          >
            Continue as Guest
          </button>
        </form>
      </div>
    </div>
  );
}

// Purchase modal
function PurchaseModal({
  selection,
  onClose,
  onPurchase,
}: {
  selection: { x: number; y: number; width: number; height: number };
  onClose: () => void;
  onPurchase: (title: string, linkUrl?: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const numCells = selection.width * selection.height;
  const price = numCells;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onPurchase(title, linkUrl || undefined);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 border-2 border-amber-400/40 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-scale-in">
        <h2 className="font-display text-2xl md:text-3xl text-amber-100 mb-2">Buy Your Barry!</h2>
        <p className="text-amber-200/70 mb-6">
          {selection.width}×{selection.height} cells = <span className="text-amber-300 font-bold">${price}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-amber-200 text-sm mb-1">Title (required)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Barry Block"
              required
              className="w-full px-4 py-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-amber-50 placeholder-amber-400/50 focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-amber-200 text-sm mb-1">Link URL (optional)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-amber-50 placeholder-amber-400/50 focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-amber-500/40 text-amber-300 rounded-xl hover:bg-amber-500/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-amber-950 font-display rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50"
            >
              {loading ? "Buying..." : `Buy for $${price}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// The main pixel grid
function PixelGrid() {
  const pixels = useQuery(api.pixels.getAllPixels);
  const stats = useQuery(api.pixels.getStats);
  const purchasePixels = useMutation(api.pixels.purchasePixels);
  const { signOut } = useAuthActions();

  const [selection, setSelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hoveredPixel, setHoveredPixel] = useState<Pixel | null>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");

  const GRID_SIZE = 100;
  const CELL_SIZE = 10;

  // Build occupied cells set
  const occupiedCells = new Set<string>();
  (pixels as Pixel[] | undefined)?.forEach((p: Pixel) => {
    for (let x = p.x; x < p.x + p.width; x++) {
      for (let y = p.y; y < p.y + p.height; y++) {
        occupiedCells.add(`${x},${y}`);
      }
    }
  });

  const getCellFromEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * GRID_SIZE);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * GRID_SIZE);
    return { x: Math.max(0, Math.min(GRID_SIZE - 1, x)), y: Math.max(0, Math.min(GRID_SIZE - 1, y)) };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getCellFromEvent(e);
    if (!occupiedCells.has(`${x},${y}`)) {
      setSelection({ startX: x, startY: y, endX: x, endY: y });
      setIsSelecting(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelecting && selection) {
      const { x, y } = getCellFromEvent(e);
      // Limit selection to 10x10
      const newEndX = Math.min(x, selection.startX + 9);
      const newEndY = Math.min(y, selection.startY + 9);
      setSelection({ ...selection, endX: newEndX, endY: newEndY });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selection) {
      setIsSelecting(false);
      const x = Math.min(selection.startX, selection.endX);
      const y = Math.min(selection.startY, selection.endY);
      const width = Math.abs(selection.endX - selection.startX) + 1;
      const height = Math.abs(selection.endY - selection.startY) + 1;

      // Check if selection overlaps with owned cells
      let hasOverlap = false;
      for (let cx = x; cx < x + width; cx++) {
        for (let cy = y; cy < y + height; cy++) {
          if (occupiedCells.has(`${cx},${cy}`)) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }

      if (hasOverlap) {
        setSelection(null);
        setError("Can't select cells that are already owned!");
        setTimeout(() => setError(""), 3000);
      } else {
        setShowModal(true);
      }
    }
  };

  const handlePurchase = async (title: string, linkUrl?: string) => {
    if (!selection) return;
    const x = Math.min(selection.startX, selection.endX);
    const y = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX) + 1;
    const height = Math.abs(selection.endY - selection.startY) + 1;

    try {
      await purchasePixels({
        startX: x,
        startY: y,
        width,
        height,
        title,
        linkUrl,
      });
      setShowModal(false);
      setSelection(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getSelectionBox = () => {
    if (!selection) return null;
    const x = Math.min(selection.startX, selection.endX);
    const y = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX) + 1;
    const height = Math.abs(selection.endY - selection.startY) + 1;
    return { x, y, width, height };
  };

  const selectionBox = getSelectionBox();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-900 flex flex-col">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-20 px-4 py-4 md:py-6 border-b border-amber-500/20 bg-amber-950/40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-amber-100 leading-tight">
              The Million Barry Page
            </h1>
            <p className="text-amber-300/70 text-sm md:text-base mt-1">
              Own a piece of Barry Chuckle history!
            </p>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {stats && (
              <div className="flex gap-4 md:gap-6 text-center">
                <div>
                  <div className="text-xl md:text-2xl font-display text-amber-200">{stats.totalSold.toLocaleString()}</div>
                  <div className="text-xs text-amber-400/60">Sold</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display text-green-400">${stats.totalRevenue.toLocaleString()}</div>
                  <div className="text-xs text-amber-400/60">Raised</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display text-amber-200">{stats.totalAvailable.toLocaleString()}</div>
                  <div className="text-xs text-amber-400/60">Available</div>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="px-4 py-2 border border-amber-500/40 text-amber-300 rounded-lg hover:bg-amber-500/10 transition-all text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce-in">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="relative z-10 px-4 py-4 text-center">
        <p className="text-amber-200/80 text-sm md:text-base max-w-2xl mx-auto">
          Click and drag on empty cells to select an area (max 10×10). Each cell costs <span className="text-amber-300 font-semibold">$1</span> and displays a glorious Barry Chuckle photo!
        </p>
      </div>

      {/* Zoom controls */}
      <div className="relative z-10 px-4 pb-4 flex justify-center gap-2">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
          className="px-3 py-1 bg-amber-900/50 border border-amber-500/30 text-amber-200 rounded-lg hover:bg-amber-800/50 transition-all"
        >
          -
        </button>
        <span className="px-3 py-1 text-amber-300">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
          className="px-3 py-1 bg-amber-900/50 border border-amber-500/30 text-amber-200 rounded-lg hover:bg-amber-800/50 transition-all"
        >
          +
        </button>
      </div>

      {/* Main grid container */}
      <main className="flex-1 relative z-10 px-4 pb-8 overflow-auto">
        <div className="flex justify-center">
          <div
            className="relative border-4 border-amber-400/40 rounded-lg shadow-2xl bg-amber-950/30 overflow-hidden"
            style={{
              width: `${GRID_SIZE * CELL_SIZE * zoom}px`,
              height: `${GRID_SIZE * CELL_SIZE * zoom}px`,
              maxWidth: "100%",
            }}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0 cursor-crosshair select-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(251,191,36,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(251,191,36,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE * zoom}px ${CELL_SIZE * zoom}px`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => isSelecting && handleMouseUp()}
            >
              {/* Render owned pixels */}
              {(pixels as Pixel[] | undefined)?.map((pixel: Pixel) => (
                <div
                  key={pixel._id}
                  className="absolute overflow-hidden rounded-sm shadow-lg transition-transform hover:scale-105 hover:z-10 cursor-pointer group"
                  style={{
                    left: `${pixel.x * CELL_SIZE * zoom}px`,
                    top: `${pixel.y * CELL_SIZE * zoom}px`,
                    width: `${pixel.width * CELL_SIZE * zoom}px`,
                    height: `${pixel.height * CELL_SIZE * zoom}px`,
                  }}
                  onMouseEnter={() => setHoveredPixel(pixel)}
                  onMouseLeave={() => setHoveredPixel(null)}
                  onClick={() => pixel.linkUrl && window.open(pixel.linkUrl, "_blank")}
                >
                  <img
                    src={pixel.imageUrl}
                    alt={pixel.title}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/${pixel.width * 10}x${pixel.height * 10}/d97706/fef3c7?text=Barry`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-white text-[8px] truncate font-medium">{pixel.title}</span>
                  </div>
                </div>
              ))}

              {/* Selection overlay */}
              {selectionBox && (
                <div
                  className="absolute border-2 border-dashed border-amber-300 bg-amber-400/20 pointer-events-none animate-pulse"
                  style={{
                    left: `${selectionBox.x * CELL_SIZE * zoom}px`,
                    top: `${selectionBox.y * CELL_SIZE * zoom}px`,
                    width: `${selectionBox.width * CELL_SIZE * zoom}px`,
                    height: `${selectionBox.height * CELL_SIZE * zoom}px`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-amber-500 text-amber-950 text-xs px-2 py-1 rounded font-medium whitespace-nowrap">
                    {selectionBox.width}×{selectionBox.height} = ${selectionBox.width * selectionBox.height}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Hover tooltip */}
      {hoveredPixel && (
        <div className="fixed bottom-4 left-4 bg-amber-900/95 backdrop-blur border border-amber-500/40 rounded-lg p-4 shadow-xl max-w-xs z-30">
          <h3 className="font-display text-amber-100 text-lg">{hoveredPixel.title}</h3>
          <p className="text-amber-300/70 text-sm mt-1">
            {hoveredPixel.width}×{hoveredPixel.height} cells • ${hoveredPixel.priceInCents / 100}
          </p>
          {hoveredPixel.linkUrl && (
            <p className="text-amber-400/60 text-xs mt-2 truncate">{hoveredPixel.linkUrl}</p>
          )}
        </div>
      )}

      {/* Purchase modal */}
      {showModal && selectionBox && (
        <PurchaseModal
          selection={selectionBox}
          onClose={() => {
            setShowModal(false);
            setSelection(null);
          }}
          onPurchase={handlePurchase}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-amber-500/10 bg-amber-950/30">
        <p className="text-amber-500/40 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

// Main app wrapper
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-yellow-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-200 font-display text-xl">Loading the Barrys...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <PixelGrid />;
}
