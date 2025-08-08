import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminBukkenRegisterForm() {
  // 地域、詳細住所、画像などの状態管理
  const [largeArea, setLargeArea] = useState("");
  const [smallArea, setSmallArea] = useState("");
  const [smallAreaOptions, setSmallAreaOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [address_town, setAddressTown] = useState("");
  const [address_chome, setAddressChome] = useState("");
  const [address_banchi, setAddressBanchi] = useState("");
  const [address_go, setAddressGo] = useState("");
  const [address_building, setAddressBuilding] = useState("");
  
  // 詳細住所の文字列を作成
  const addressParts = [];
  if (address_town && address_town.trim() !== '') {
    addressParts.push(address_town.trim());
  }
  if (address_chome && address_chome.trim() !== '') {
    addressParts.push(`${address_chome.trim()}丁目`);
  }
  if (address_banchi && address_banchi.trim() !== '') {
    addressParts.push(`${address_banchi.trim()}番地`);
  }
  if (address_go && address_go.trim() !== '') {
    addressParts.push(`${address_go.trim()}号`);
  }
  if (address_building && address_building.trim() !== '') {
    addressParts.push(address_building.trim());
  }

  const fullAddress = addressParts.join(' ');

  const navigate = useNavigate();

    // 大エリア選択時に小エリアをセット
  const handleLargeAreaChange = (e) => {
    const selectedLargeArea = e.target.value;
    setLargeArea(selectedLargeArea);
    setSmallArea("");

    // 選択に応じて市区リストを設定
    switch (selectedLargeArea) {
      case "東京23区":
        setSmallAreaOptions([
          "渋谷区", "新宿区", "豊島区", "港区", "中央区",
          "千代田区", "文京区", "墨田区", "江東区", "台東区",
          "足立区", "荒川区", "品川区", "大田区", "北区",
          "板橋区", "練馬区", "杉並区", "中野区", "世田谷区",
          "目黒区", "大田区", "江東区"
        ]);
        break;
      case "東京都下":
        setSmallAreaOptions([
          "八王子市", "立川市", "武蔵野市", "町田市", "調布市", 
          "三鷹市", "青梅市", "府中市", "小金井市", "国立市","昭島市",
          "あきる野市","稲城市","清瀬市","国分寺市","小平市","狛江市",
          "多摩市","西東京市","羽村市","東久留米市","東村山市","東大和市",
          "日野市","福生市","武蔵村山市","西多摩郡"
        ]);
        break;
      case "横浜川":
        setSmallAreaOptions([
          "横浜市鶴見区", "横浜市神奈川区", "横浜市西区", "横浜市中区",
          "横浜市南区", "横浜市保土ケ谷区", "横浜市磯子区", "横浜市金沢区",
          "横浜市港北区", "横浜市戸塚区", "横浜市港南区", "横浜市旭区", 
          "横浜市緑区", "横浜市瀬谷区", "横浜市栄区", "横浜市泉区",
          "横浜市青葉区", "横浜市都筑区", "川崎市川崎区", "川崎市幸区",
          "川崎市中原区", "川崎市高津区", "川崎市多摩区", "川崎市宮前区",
          "川崎市麻生区", "相模原市緑区", "相模原市中央区", "相模原市南区",
          "横須賀市", "平塚市", "鎌倉市", "藤沢市", "小田原市", "茅ヶ崎市",
          "逗子市", "秦野市", "三浦市", "厚木市", "大和市", "伊勢原市",
          "海老名市", "座間市", "南足柄市", "綾瀬市", "三浦郡", "高座郡",
          "中郡", "足柄上郡", "足柄下郡", "愛甲郡", "津久井郡"
        ]);
        break;
      case "埼玉":
        setSmallAreaOptions([
          "さいたま市浦和区", "さいたま市大宮区", "さいたま市北区", "さいたま市桜区",
          "さいたま市中央区", "さいたま市西区", "さいたま市緑区", "さいたま市南区",
          "さいたま市見沼区", "さいたま市岩槻区", "上尾市", "朝霞市", "入間市",
          "桶川市", "春日部市", "加須市", "ふじみ野市", "川口市", "川越市", "北本市",
          "行田市", "久喜市", "熊谷市", "鴻巣市", "越谷市", "坂戸市", "幸手市", "狭山市",
          "志木市", "草加市", "秩父市", "鶴ヶ島市", "所沢市", "戸田市", "新座市",
          "蓮田市", "羽生市", "飯能市", "東松山市", "日高市", "深谷市", "富士見市",
          "本庄市", "三郷市", "八潮市", "吉川市", "和光市", "蕨市", "白岡市", "入間郡",
          "大里郡", "北足立郡", "北葛飾郡", "児玉郡", "秩父郡", "比企郡", "南埼玉郡"
        ]);
        break;
      case "千葉":
        setSmallAreaOptions([
          "千葉市中央区", "千葉市花見川区", "千葉市稲毛区", "千葉市若葉区", "千葉市緑区",
          "千葉市美浜区", "銚子市", "市川市", "船橋市", "館山市", "木更津市", "松戸市",
          "野田市", "佐原市", "茂原市", "佐倉市", "成田市", "東金市", "旭市", "八日市場市",
          "習志野市", "柏市", "勝浦市", "市原市", "流山市", "八千代市", "我孫子市", "鴨川市",
          "鎌ヶ谷市", "君津市", "富津市", "浦安市", "四街道市", "袖ヶ浦市", "八街市", 
          "印南市", "印西市", "白井市", "冨里市", "南房総市", "匝瑳市", "香取市", "山武市",
          "いすみ市", "大網白里市", "安房郡", "夷隈郡", "長生郡", "山武郡", "東葛飾郡", "印旛郡",
          "香取郡", "海上郡", "匝瑳郡"
        ]);
        break;
      case "大阪":
        setSmallAreaOptions([
          "大阪市都島区", "大阪市福島区", "大阪市此花区", "大阪市西区", "大阪市港区", "大阪市大正区",
          "大阪市天王寺区", "大阪市浪速区", "大阪市西淀川区", "大阪市東淀川区", "大阪市東成区", "大阪市生野区",
          "大阪市旭区", "大阪市城東区", "大阪市阿倍野区", "大阪市住吉区", "大阪市東住吉区", 
          "大阪市西成区", "大阪市淀川区", "大阪市鶴見区", "大阪市住之江区", "大阪市平野区",
          "大阪市北区", "大阪市中央区", "堺市堺区", "堺市中区", "堺市東区", "堺市西区", "堺市南区",
          "堺市北区", "堺市美原区", "岸和田市", "豊中市", "池田市", "吹田市", "泉大津市", "高槻市",
          "貝塚市", "守口市", "枚方市", "茨木市", "八尾市", "泉佐野市", "富田林市", "寝屋川市", "河内長野市",
          "松原市", "大東市", "和泉市", "箕面市", "柏原市", "羽曳野市", "門真市", "摂津市", "高石市", 
          "藤井寺市", "東大阪市", "泉南市", "四條畷市", "交野市", "大阪狭山市", "阪南市", "三島郡", 
          "豊能郡", "泉北郡", "泉南郡", "南河内郡"
        ]);
        break;
      default:
        setSmallAreaOptions([]);
    }
  };

  // 小エリア変更
  const handleSmallAreaChange = (e) => {
    setSmallArea(e.target.value);
  };

  // 画像追加時の処理
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
    setPreviews((prev) => [
      ...prev, 
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  // 画像クリック時に選択・選択解除
  const handleImageClick = (index) => {
    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    })
  };

  // 選択した画像を削除
  const handleRemoveSelected = () => {
    setImages((prev) => prev.filter((_, i) => !selectedIndices.includes(i)));
    setPreviews((prev) => prev.filter((_, i) => !selectedIndices.includes(i)));
    setSelectedIndices([]);
  };


  // 次の詳細入力ページへ移動
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      navigate("/admin-bukken-register-2", {
        state: {
          largeArea,
          smallArea,
          address: fullAddress,
          address_town,
          address_chome,
          address_banchi,
          address_go,
          address_building,
          images
        }
      });
    } catch (error) {
      alert("登録失敗: " + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>物件登録</h2>
      <p className='text-danger mb-4'>※ 色のついた欄は必須入力項目です。</p>
      <form className="card p-4 shadow-sm" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">地域選択</label>
          <select className="form-select" value={largeArea} 
          onChange={handleLargeAreaChange} required
          style={{backgroundColor: largeArea.trim()=== '' ? '#e9967a' : 'white'}}>
            <option value="">-地域選択-</option>
            <option value="東京23区">東京23区</option>
            <option value="東京都下">東京都下</option>
            <option value="横浜川">横浜・川崎</option>
            <option value="埼玉">埼玉</option>
            <option value="千葉">千葉</option>
            <option value="大阪">大阪</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">市区選択</label>
          <select className="form-select" value={smallArea} 
          onChange={handleSmallAreaChange} required disabled={!largeArea}
          style={{backgroundColor: smallArea.trim()=== '' ? '#e9967a' : 'white'}}>
            <option value="">市区を選択</option>
            {smallAreaOptions.map((area, index) => (
              <option key={index} value={area}>{area}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-3">
          <label className="form-label">詳細住所</label>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder="00町"    
                value={address_town}
                onChange={(e) => setAddressTown(e.target.value)}
                required
                style={{ width: '80px', backgroundColor: address_town.trim()=== '' ? '#e9967a' : 'white' }}
              />
              
            </div>

            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder=""
                value={address_chome}
                onChange={(e) => setAddressChome(e.target.value)}
                style={{ width: '80px' }}
              />
              <span className="ms-1">丁目</span>
            </div>

            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder=""
                value={address_banchi}
                onChange={(e) => setAddressBanchi(e.target.value)}
                required
                style={{ width: '80px', backgroundColor: address_banchi.trim()=== '' ?  '#e9967a' : 'white' }}
              />
              <span className="ms-1">番地</span>
            </div>

            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder=""
                value={address_go}
                onChange={(e) => setAddressGo(e.target.value)}
                style={{ width: '80px' }}
              />
              <span className="ms-1">号</span>
            </div>

            <div className="d-flex align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder="ビル名"
                value={address_building}
                onChange={(e) => setAddressBuilding(e.target.value)}
                style={{ width: '160px' }}
              />
            </div>
          </div>
        </div>


        <div className="mb-3">
          <label className="form-label">物件写真</label>
          <input 
            type='file' 
            accept='image/*' 
            multiple 
            className='form-control'
            onChange={handleImageChange}/>
        </div>

      {previews.length > 0 && (
        <>
          <button
            type='button'
            className='btn btn-danger mb-3'
            onClick={handleRemoveSelected}
            disabled={selectedIndices.length === 0}
          >
            選択した画像を削除
          </button>

          <div className="row">
            {previews.map((url, index) => (
              <div className="col-md-3 mb-3" key={index}>
                <div
                  className={`card ${selectedIndices.includes(index) ? 'border-danger border-3' : ''}`}
                  onClick={() => handleImageClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={url} 
                    className="card-img-top" 
                    alt={`preview-${index}`} 
                    style={{width : '100%', height: '150px', objectFit: 'cover'}}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

        <button type="submit" className="btn btn-primary">情報入力画面へ</button>
      </form>
    </div>
    
  );
}

export default AdminBukkenRegisterForm;
