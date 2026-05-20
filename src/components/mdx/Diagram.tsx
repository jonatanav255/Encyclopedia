import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

type BoxProps = {
  id: string;
  x: number;
  y: number;
  variant?: 'default' | 'accent' | 'muted';
  children: ReactNode;
};

type ArrowProps = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  curve?: 'up' | 'down';
};

export function DBox(_props: BoxProps): null {
  return null;
}

export function DArrow(_props: ArrowProps): null {
  return null;
}

const CELL_W = 200;
const CELL_H = 110;
const BOX_W = 160;
const BOX_H = 70;
const PAD_X = 40;
const PAD_Y = 30;

type Box = { id: string; cx: number; cy: number; props: BoxProps };

export function Diagram({ children, caption }: { children: ReactNode; caption?: string }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<
    BoxProps | ArrowProps
  >[];

  const boxItems = items.filter((c): c is ReactElement<BoxProps> => c.type === DBox);
  const arrowItems = items.filter((c): c is ReactElement<ArrowProps> => c.type === DArrow);

  const maxX = Math.max(0, ...boxItems.map((b) => b.props.x));
  const maxY = Math.max(0, ...boxItems.map((b) => b.props.y));
  const hasDownCurve = arrowItems.some((a) => a.props.curve === 'down');
  const hasUpCurve = arrowItems.some((a) => a.props.curve === 'up');
  const extraBottom = hasDownCurve ? 60 : 0;
  const extraTop = hasUpCurve ? 60 : 0;
  const width = (maxX + 1) * CELL_W + PAD_X * 2;
  const height = (maxY + 1) * CELL_H + PAD_Y * 2 + extraBottom + extraTop;

  const boxes: Record<string, Box> = {};
  for (const b of boxItems) {
    const cx = PAD_X + b.props.x * CELL_W + CELL_W / 2;
    const cy = PAD_Y + extraTop + b.props.y * CELL_H + CELL_H / 2;
    boxes[b.props.id] = { id: b.props.id, cx, cy, props: b.props };
  }

  return (
    <figure className="not-prose my-6">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width }}
          className="block mx-auto"
        >
          <defs>
            <marker
              id="diagram-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" className="fill-zinc-500 dark:fill-zinc-400" />
            </marker>
          </defs>

          {arrowItems.map((a, i) => {
            const from = boxes[a.props.from];
            const to = boxes[a.props.to];
            if (!from || !to) return null;
            const curve = a.props.curve;
            const { x1, y1, x2, y2 } = edgePoints(from, to, curve);
            const path = buildPath(x1, y1, x2, y2, curve, height);
            const labelPos = labelPoint(x1, y1, x2, y2, curve, height);
            return (
              <g key={`arrow-${i}`}>
                <path
                  d={path}
                  fill="none"
                  strokeWidth={1.5}
                  className="stroke-zinc-500 dark:stroke-zinc-400"
                  strokeDasharray={a.props.dashed ? '5 4' : undefined}
                  markerEnd="url(#diagram-arrow)"
                />
                {a.props.label && (
                  <g>
                    <rect
                      x={labelPos.x - estimateLabelWidth(a.props.label) / 2 - 4}
                      y={labelPos.y - 11}
                      width={estimateLabelWidth(a.props.label) + 8}
                      height={16}
                      rx={4}
                      className="fill-zinc-50 dark:fill-zinc-900"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      className="fill-zinc-600 dark:fill-zinc-400"
                      style={{ fontSize: 12 }}
                    >
                      {a.props.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {Object.values(boxes).map((b) => {
            const x = b.cx - BOX_W / 2;
            const y = b.cy - BOX_H / 2;
            const { fill, stroke, text } = variantClasses(b.props.variant);
            return (
              <g key={b.id}>
                <rect
                  x={x}
                  y={y}
                  width={BOX_W}
                  height={BOX_H}
                  rx={10}
                  className={`${fill} ${stroke}`}
                  strokeWidth={1.5}
                />
                <foreignObject x={x} y={y} width={BOX_W} height={BOX_H}>
                  <div
                    className={`w-full h-full flex items-center justify-center text-center text-sm font-medium px-3 ${text}`}
                  >
                    {b.props.children}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function edgePoints(a: Box, b: Box, curve?: 'up' | 'down') {
  if (curve === 'down') {
    return {
      x1: a.cx,
      y1: a.cy + BOX_H / 2,
      x2: b.cx,
      y2: b.cy + BOX_H / 2,
    };
  }
  if (curve === 'up') {
    return {
      x1: a.cx,
      y1: a.cy - BOX_H / 2,
      x2: b.cx,
      y2: b.cy - BOX_H / 2,
    };
  }
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const horiz = Math.abs(dx) >= Math.abs(dy);

  if (horiz) {
    const sign = Math.sign(dx) || 1;
    return {
      x1: a.cx + (sign * BOX_W) / 2,
      y1: a.cy,
      x2: b.cx - (sign * BOX_W) / 2,
      y2: b.cy,
    };
  }
  const sign = Math.sign(dy) || 1;
  return {
    x1: a.cx,
    y1: a.cy + (sign * BOX_H) / 2,
    x2: b.cx,
    y2: b.cy - (sign * BOX_H) / 2,
  };
}

function buildPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curve: 'up' | 'down' | undefined,
  height: number,
): string {
  if (!curve) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const sag = 40;
  const cy = curve === 'down' ? Math.max(y1, y2) + sag : Math.min(y1, y2) - sag;
  const _ = height; // reserved for future bounds checks
  void _;
  return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${cy}, ${x2} ${y2}`;
}

function labelPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curve: 'up' | 'down' | undefined,
  height: number,
) {
  if (!curve) return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6 };
  const sag = 40;
  const apex = curve === 'down' ? Math.max(y1, y2) + sag / 1.5 : Math.min(y1, y2) - sag / 1.5;
  const _ = height;
  void _;
  return { x: (x1 + x2) / 2, y: apex };
}

function estimateLabelWidth(label: string) {
  return label.length * 7;
}

function variantClasses(variant: BoxProps['variant']) {
  switch (variant) {
    case 'accent':
      return {
        fill: 'fill-sky-500/15 dark:fill-sky-500/15',
        stroke: 'stroke-sky-500/60',
        text: 'text-sky-800 dark:text-sky-200',
      };
    case 'muted':
      return {
        fill: 'fill-zinc-100 dark:fill-zinc-800/60',
        stroke: 'stroke-zinc-300 dark:stroke-zinc-700',
        text: 'text-zinc-500 dark:text-zinc-400',
      };
    default:
      return {
        fill: 'fill-white dark:fill-zinc-900',
        stroke: 'stroke-zinc-300 dark:stroke-zinc-700',
        text: 'text-zinc-800 dark:text-zinc-100',
      };
  }
}
