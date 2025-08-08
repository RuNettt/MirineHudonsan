import React, { useState, useEffect } from "react";
import "./SearchModal.css";

function SearchModal({ isOpen, onClose, onSearch, isTransfer, initialTab = "region" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStation, setSelectedStation] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [floor, setFloor] = useState("");
  const [walkTime, setWalkTime] = useState("");
  const [roadside, setRoadside] = useState(false);
  const [industry, setIndustry] = useState({
    飲食店: false,
    軽飲食: false,
    バー: false,
    美容室: false,
    医療: false,
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleIndustryChange = (key) => {
    setIndustry({ ...industry, [key]: !industry[key] });
  };

  const handleSearchClick = () => {
    onSearch({
      area: selectedArea,
      station: selectedStation,
      minRent,
      maxRent,
      minSize,
      maxSize,
      floor,
      walkTime,
      roadside,
      industry,
    });
    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? "show" : "hide"}`}>
      <div className="modal-box">
        {/* 탭 */}
        <div className="tabs">
          <button
            className={activeTab === "region" ? "active" : ""}
            onClick={() => setActiveTab("region")}
          >
            地域から探す
          </button>
          {!isTransfer && (
            <button
              className={activeTab === "station" ? "active" : ""}
              onClick={() => setActiveTab("station")}
            >
              駅から探す
            </button>
          )}
        </div>

        {/* ① 지역 or 역 선택 */}
        <div className="section">
          <label className="section-title">1.エリアを選択してください</label>
          <div className="area-options">
            <button onClick={() => activeTab === "station" ? setSelectedStation("大阪駅") : setSelectedArea("大阪")}>大阪</button>
            <button onClick={() => activeTab === "station" ? setSelectedStation("兵庫駅") : setSelectedArea("兵庫")}>兵庫</button>
            <button onClick={() => activeTab === "station" ? setSelectedStation("京都駅") : setSelectedArea("京都")}>京都</button>
          </div>
        </div>

        {/* ② 선택 결과 표시 */}
        <div className="section">
          <label className="section-title">
            2.{activeTab === "region" ? "地域" : "路線"}を選択してください
          </label>
          <div className="selection-result">
            {activeTab === "region"
              ? selectedArea || "選択なし"
              : selectedStation || "選択なし"}
          </div>
        </div>

        {/* 출점 업종 */}
        <div className="filter-section">
          <label className="section-title">出店可能な業種</label>
          <div className="checkbox-group">
            {Object.keys(industry).map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={industry[key]}
                  onChange={() => handleIndustryChange(key)}
                />
                {key}
              </label>
            ))}
          </div>
        </div>

        <hr className="section-divider" />

        {/* 조건 필터 */}
        <div className="filter-grid">
          {/*賃料*/}
          <div className="filter-group">
            <div className="filter-row">
              <label>賃料</label>
              <select value={minRent} onChange={(e) => setMinRent(e.target.value)}>
                <option value="">下限なし</option>
                <option value="5">5万円</option>
                <option value="10">10万円</option>
              </select>
              <span>～</span>
              <select value={maxRent} onChange={(e) => setMaxRent(e.target.value)}>
                <option value="">上限なし</option>
                <option value="30">30万円</option>
                <option value="50">50万円</option>
              </select>
            </div>
          </div>

          {/*面積*/}
          <div className="filter-group">
            <div className="filter-row">
              <label>面積</label>
              <select value={minSize} onChange={(e) => setMinSize(e.target.value)}>
                <option value="">下限なし</option>
                <option value="10">10㎡</option>
                <option value="20">20㎡</option>
              </select>
              <span>～</span>
              <select value={maxSize} onChange={(e) => setMaxSize(e.target.value)}>
                <option value="">上限なし</option>
                <option value="50">50㎡</option>
                <option value="100">100㎡</option>
              </select>
            </div>
          </div>

          {/*階数*/}
          <div className="filter-group">
            <div className="filter-row">
              <label>階数</label>
              <select value={floor} onChange={(e) => setFloor(e.target.value)}>
                <option value="">選択なし</option>
                <option value="1階">1階</option>
                <option value="2階">2階</option>
                <option value="3階以上">3階以上</option>
              </select>
            </div>
          </div>

          {/*徒歩*/}
          <div className="filter-group">
            <div className="filter-row">
              <label>徒歩</label>
              <select value={walkTime} onChange={(e) => setWalkTime(e.target.value)}>
                <option value="">選択なし</option>
                <option value="1">1分以内</option>
                <option value="3">3分以内</option>
                <option value="5">5分以内</option>
                <option value="7">7分以内</option>
                <option value="10">10分以内</option>
                <option value="15">15分以内</option>
              </select>
            </div>
          </div>

          {/*こだわり条件*/}
          <div className="filter-group">
            <div className="filter-row">
              <label>こだわり条件</label>
              <label>
                <input
                  type="checkbox"
                  checked={roadside}
                  onChange={(e) => setRoadside(e.target.checked)}
                />
                ロードサイド
              </label>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="modal-buttons">
          <button
            className="btn reset"
            onClick={() => {
              setSelectedArea("");
              setSelectedStation("");
              setMinRent("");
              setMaxRent("");
              setMinSize("");
              setMaxSize("");
              setFloor("");
              setWalkTime("");
              setRoadside(false);
              setIndustry({
                飲食店: false,
                軽飲食: false,
                バー: false,
                美容室: false,
                医療: false,
              });
            }}
          >
            条件クリア
          </button>
          <button className="btn search" onClick={handleSearchClick}>
            この条件で検索する
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
