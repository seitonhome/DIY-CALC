"use client";
import { CheckSquare } from "lucide-react";

export interface RecipeItem {
  label: string;
  amount: string;
  sub?: string;
  highlight?: boolean;
  separator?: boolean;
}

interface RecipeCardProps {
  title: string;
  items: RecipeItem[];
  note?: string;
  locale?: string;
}

export function RecipeCard({ title, items, note, locale }: RecipeCardProps) {
  return (
    <div style={{
      background: "white",
      border: "1.5px solid #C9A347",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "#C9A347",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <CheckSquare size={16} style={{ color: "white", flexShrink: 0 }} />
        <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{title}</p>
      </div>

      {/* Items */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
        {items.map((item, i) => {
          if (item.separator) {
            return <div key={i} style={{ height: 1, background: "#EDE8E1", margin: "8px 0" }} />;
          }
          return (
            <div key={i} style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              padding: "5px 0",
              borderBottom: i < items.length - 1 && !items[i + 1]?.separator ? "1px dotted #EDE8E1" : "none",
            }}>
              <div>
                <span style={{
                  fontSize: 13,
                  color: item.highlight ? "#2C2C2C" : "#5a534e",
                  fontWeight: item.highlight ? 700 : 400,
                }}>
                  {item.label}
                </span>
                {item.sub && (
                  <span style={{ fontSize: 11, color: "#A8862A", marginLeft: 6 }}>{item.sub}</span>
                )}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: item.highlight ? 800 : 600,
                color: item.highlight ? "#A8862A" : "#2C2C2C",
                marginLeft: 12,
                flexShrink: 0,
              }}>
                {item.amount}
              </span>
            </div>
          );
        })}
      </div>

      {note && (
        <div style={{
          background: "#F5F0EA",
          padding: "8px 16px",
          borderTop: "1px solid #EDE8E1",
        }}>
          <p style={{ fontSize: 11, color: "#9E998F", margin: 0 }}>{note}</p>
        </div>
      )}
    </div>
  );
}
