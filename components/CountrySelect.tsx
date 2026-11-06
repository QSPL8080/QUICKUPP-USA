"use client";

import { useState, useRef, useEffect, useId } from "react";
import { COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  style?: React.CSSProperties;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function CountrySelect({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder = "Select or type country",
  className = "su-text-input",
  autoComplete = "country-name",
  style,
  onFocus,
  onBlur,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id || generatedId;

  // Filter countries based on input
  const query = (isOpen ? filterText : value) || "";
  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase().trim())
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlighted index when filtered list changes
  const [listLen, setListLen] = useState(filteredCountries.length);
  if (listLen !== filteredCountries.length) {
    setListLen(filteredCountries.length);
    setHighlightedIndex(0);
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilterText(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectCountry = (country: string) => {
    onChange(country);
    setFilterText(country);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredCountries.length - 1));
      }
    } else if (e.key === "Enter") {
      if (isOpen && filteredCountries[highlightedIndex]) {
        e.preventDefault();
        handleSelectCountry(filteredCountries[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={className}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setFilterText(value);
            setIsOpen(true);
            onFocus?.();
          }}
          onBlur={() => {
            onBlur?.();
          }}
          onClick={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{
            paddingRight: "38px",
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
          style={{
            position: "absolute",
            right: "12px",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            pointerEvents: "auto",
          }}
          aria-label="Toggle country list"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: "240px",
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.12)",
            zIndex: 99999,
            padding: "4px",
          }}
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((c, idx) => {
              const isSelected = c.toLowerCase() === value.toLowerCase();
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={c}
                  onClick={() => handleSelectCountry(c)}
                  style={{
                    padding: "9px 12px",
                    fontSize: "13.5px",
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#4f46e5" : "#1e293b",
                    background: isSelected ? "#f5f3ff" : isHighlighted ? "#f8fafc" : "transparent",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                >
                  <span>{c}</span>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "10px 12px",
                fontSize: "13px",
                color: "#64748b",
                textAlign: "center",
              }}
            >
              No matching country found (you can still use what you typed)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
