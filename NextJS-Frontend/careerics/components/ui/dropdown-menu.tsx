"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  id: string;
  title: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  onChange: (id: string) => void;
}

export default function CustomDropdown({
  value,
  options,
  placeholder = "Select option",
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(
    (opt) => opt.id === value
  );

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "280px",
        fontFamily: "var(--font-nova-square)",
      }}
    >
      {/* Selected Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        style={{
          width: "100%",
          height: "44px",
          borderRadius: "999px",
          border: "0.5vh solid var(--medium-blue)",
          backgroundColor: "transparent",
          paddingLeft: "16px",
          paddingRight: "40px",
          fontSize: "0.95rem",
          color: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <span>
          {selectedOption
            ? selectedOption.title
            : placeholder}
        </span>

        <ChevronDown
          size={18}
          style={{
            position: "absolute",
            right: "12px",
            transition: "transform 0.2s",
            color:"var(--medium-blue)",
            transform: isOpen
              ? "rotate(180deg)"
              : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            width: "100%",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "#ffffff",
            boxShadow:
              "0px 8px 18px rgba(0,0,0,0.08)",
            overflow: "hidden",
            zIndex: 999,
            height: "300px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor:
              "rgba(0,0,0,0.2) transparent",
          }}
        >
          {options.length > 0 ? (
            options.map((option) => {
              const isActive =
                option.id === value;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    handleSelect(option.id)
                  }
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 16px",
                    backgroundColor: isActive
                      ? "#e8f2ff"
                      : "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition:
                      "background-color 0.15s",
                  }}
                >
                  {option.title}
                </button>
              );
            })
          ) : (
            <div
              style={{
                padding: "12px 16px",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}