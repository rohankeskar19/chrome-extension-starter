import { DatePicker, Select } from "antd";
import Checkbox from "antd/lib/checkbox/Checkbox";
import React, { useState, useEffect } from "react";
import "./highlightssearch.css";

const { RangePicker } = DatePicker;

function HighlightsSearch({
  open,
  addHighlightColor,
  addTag,
  setFavourited,
  addWebsite,
}) {
  const [state, setState] = useState({
    open: open,
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        open: open,
      };
    });
  }, [open]);
  return (
    <div
      className={
        state.open
          ? "search-open highlights-filters"
          : "search-close highlights-filters"
      }
    >
      <h1>Filter Highlights</h1>
      <div className="highlights-filter-inputs">
        <div className="highlights-color-filters">
          <p>Highlight Color:</p>
          <div className="highlights-color-filter-grid">
            <div>
              <span className="highlights-color-round"></span>
              <span>Yellow</span>
            </div>
            <div>
              <span className="highlights-color-round"></span>
              <span>Blue</span>
            </div>
            <div>
              <span className="highlights-color-round"></span>
              <span>Violet</span>
            </div>
            <div>
              <span className="highlights-color-round"></span>
              <span>Red</span>
            </div>
            <div>
              <span className="highlights-color-round"></span>
              <span>Orange</span>
            </div>
            <div>
              <span className="highlights-color-round"></span>
              <span>Green</span>
            </div>
          </div>
        </div>
        <div className="highlights-date-filters">
          <p>Created on:</p>
          <div className="highlights-date-filter-data-inputs">
            <RangePicker />
          </div>
        </div>
        <div className="highlights-input-filters">
          <div>
            <p>Tags:</p>
            <Select mode="tags"></Select>
          </div>
          <div>
            <p>Website:</p>
            <Select mode="tags"></Select>
          </div>
        </div>
        <div className="highlights-checkbox-filters">
          <Checkbox>Favourited</Checkbox>
        </div>
      </div>
    </div>
  );
}

export default HighlightsSearch;
