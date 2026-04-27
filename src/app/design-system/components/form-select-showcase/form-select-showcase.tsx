"use client";

import React, { useState } from "react";
import { FormSelect } from "@app/components/ui/FormSelect";
import { Text } from "@app/components/ui/Text";
import { Tag } from "lucide-react";

export function FormSelectShowcase() {
  const [basicValue, setBasicValue] = useState("");
  const [iconValue, setIconValue] = useState("high");
  const [errorValue, setErrorValue] = useState("");

  const options = [
    { label: "Low Priority", value: "low" },
    { label: "Medium Priority", value: "medium" },
    { label: "High Priority", value: "high" },
    { label: "Urgent", value: "urgent" },
  ];

  const typeOptions = [
    { label: "Client", value: "client" },
    { label: "Mitra", value: "mitra" },
    { label: "Partner", value: "partner" },
  ];

  // Searchable Dropdown State
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchOptions, setSearchOptions] = useState([
    { label: "John Doe (LD-0001)", value: "1" },
    { label: "Jane Smith (LD-0002)", value: "2" },
    { label: "Acme Corp (LD-0003)", value: "3" },
    { label: "Global Tech (LD-0004)", value: "4" },
  ]);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    // Mock API call
    setTimeout(() => {
      const allOptions = [
        { label: "John Doe (LD-0001)", value: "1" },
        { label: "Jane Smith (LD-0002)", value: "2" },
        { label: "Acme Corp (LD-0003)", value: "3" },
        { label: "Global Tech (LD-0004)", value: "4" },
        { label: "Alice Johnson (LD-0005)", value: "5" },
        { label: "Bob Williams (LD-0006)", value: "6" },
      ];

      const filtered = query
        ? allOptions.filter((o) =>
            o.label.toLowerCase().includes(query.toLowerCase())
          )
        : allOptions;

      setSearchOptions(filtered);
      setIsSearching(false);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* --- CARD 1: STANDARD LAYOUT --- */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden lg:col-span-2">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Standard Dropdown
          </Text>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
          <FormSelect
            id="lead-type"
            label="LEAD TYPE"
            value={basicValue}
            onChange={(e) => setBasicValue(e.target.value)}
            options={typeOptions}
            placeholder="Select lead type"
          />
          <FormSelect
            id="lead-priority"
            label="PRIORITY"
            value={iconValue}
            onChange={(e) => setIconValue(e.target.value)}
            options={options}
            leftIcon={<Tag size={16} />}
          />
        </div>
      </div>

      {/* --- CARD 2: ERROR STATE --- */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Error State
          </Text>
        </div>

        <div className="w-full">
          <FormSelect
            id="error-select"
            label="STATUS"
            value={errorValue}
            onChange={(e) => setErrorValue(e.target.value)}
            options={typeOptions}
            placeholder="Choose status"
            error="Status is required to proceed"
          />
        </div>
      </div>

      {/* --- CARD 3: ASYNC SEARCH --- */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden lg:col-span-2">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Async Search (API Mock)
          </Text>
        </div>

        <div className="w-full max-w-md">
          <FormSelect
            id="search-select"
            label="ASSIGN LEAD"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            options={searchOptions}
            placeholder="Select a lead..."
            onSearch={handleSearch}
            isLoading={isSearching}
            searchPlaceholder="Search by name or ID..."
          />
        </div>
      </div>
    </div>
  );
}
