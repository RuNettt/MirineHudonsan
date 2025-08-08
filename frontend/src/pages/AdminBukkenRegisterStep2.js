import React, { useEffect, useState } from 'react';
import '../components/Step2.css';
import AdminTooltip from'../components/AdminTooltip';
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import axios from "axios";

// 📝 フロント側の物件詳細ページ（登録・編集フォーム）
function AdminBukkenRegisterStep2({ editMode = false, initialForm = null}) {
  const navigate = useNavigate();
  const location = useLocation();

    // 1ページ目から受け取ったデータ（住所、画像など）
  const {
    largeArea,
    smallArea,
    address,
    images,
    address_town,
    address_chome,
    address_banchi,
    address_go,
    address_building
  } = location.state || {};

    // 表示用住所
  const displayAddress = editMode
  ? [initialForm?.large_area, initialForm?.small_area, initialForm?.address].filter(Boolean).join(' ') || "住所未入力"
  : [largeArea, smallArea, address].filter(Boolean).join(' ') || "住所未入力";

    // 入力フォームの状態（通常テキスト系）
  const [form, setForm] = useState({
    address_town: initialForm?.address_town || "",
    address_chome: initialForm?.address_chome || "",
    address_banchi: initialForm?.address_banchi || "",
    address_go: initialForm?.address_go || "",
    address_building: initialForm?.address_building || "",
    company_tel_1: "",
    company_tel_2: "",
    company_tel_3: "",
    company_fax_1: "",
    company_fax_2: "",
    company_fax_3: "",
    });
  const [formState, setFormState] = useState({
    company_tel_1: initialForm?.company_tel_1 || "",
    company_tel_2: initialForm?.company_tel_2 || "",
    company_tel_3: initialForm?.company_tel_3 || "",
    company_fax_1: initialForm?.company_fax_1 || "",
    company_fax_2: initialForm?.company_fax_2 || "",
    company_fax_3: initialForm?.company_fax_3 || "",
    rent: initialForm?.rent || "",
    m2: initialForm?.m2 || "",
    tsubo: initialForm?.tsubo || "",
    structure: initialForm?.structure || "",
    deposit: initialForm?.deposit || "",
    contract_period: initialForm?.contract_period || "",
    key_money: initialForm?.key_money || "",
    transfer_fee: initialForm?.transfer_fee || "",
    maintenance: initialForm?.maintenance || "",
    prev_tenant: initialForm?.prev_tenant || "",
    amortization: initialForm?.amortization || "",
    renewal_fee: initialForm?.renewal_fee || "",
    built_year: initialForm?.built_year || "",
    remarks: initialForm?.remarks || "",
    coment: initialForm?.coment || "",
    company: initialForm?.company || "",
    contact: initialForm?.contact || "",
    memo: initialForm?.memo || "",
    open_range: initialForm?.open_range || false,
    customer_registration: initialForm?.customer_registration || false,
    management_id: initialForm?.management_id || "",
    station1: initialForm?.station1 || "",
    station2: initialForm?.station2 || "",
    station3: initialForm?.station3 || "",
    station4: initialForm?.station4 || "",
    station5: initialForm?.station5 || "",
    station1_walk: initialForm?.station1_walk || "",
    station1_bus: initialForm?.station1_bus || "",
    station2_walk: initialForm?.station2_walk || "",
    station2_bus: initialForm?.station2_bus || "",
    })

    // その他の状態（階数、条件チェック）
  const [enableSecond, setEnableSecond] = useState(false);
  const [showExtraCheckbox, setShowExtraCheckbox] = useState(false);
  const [buildingUpper, setBuildingUpper] = useState("");
  const [buildingLower, setBuildingLower] = useState("");
  const [floorType1, setFloorType1] = useState("地上");
  const [floorValue1, setFloorValue1] = useState("");
  const [floorType2, setFloorType2] = useState("地上");
  const [floorValue2, setFloorValue2] = useState("");
  const [extraCondition, setExtraCondition] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [selectedState, setSelectedState] = useState("")
  const [canSubmit, setCanSubmit] = useState(false);
  const [depositType, setDepositType] = useState("month");
  const [dealType, setDealType] = useState("ippan_baikai")
  const [isRentNegotiable, setIsRentNegotiable] = useState(false);
  const [isDepositNegotiable, setIsDepositNegotiable] = useState(false);
  const [isKeyMoneyNegotiable, setIsKeyMoneyNegotiable] = useState(false);
  const [isMaintNegotiable, setIsMaintNegotiable] = useState(false);
  const [isTransferNegotiable, setisTransferNegotiable] = useState(false);
  const [keyMoneyType, setKeyMoneyType] = useState("month");
  const groupMap = {
    beauty_sal: ['beauty_sub1'],
    salon_est: ['salon_esthe', 'salon_nail', 'salon_other'],
    clinic: ['clinic_c', 'clinic_dent', 'clinic_pharm', 'clinic_other'],
    retail: ['retail_app', 'retail_conv', 'retail_other'],
    gym: ['gym_studio', 'gym_gym', 'gym_class', 'gym_school'],
    other_service: ['other_store'],
  }

    // 🌟 POST or PUT 送信
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ✔ チェックされたもののみ抽出
    const checkedBusinessTypes = Object.fromEntries(
      Object.entries(formState).filter(([_, value]) => value)
    );
  
    const formData = new FormData();
  
    // 住所データ追加
    if (largeArea) formData.append("large_area", largeArea);
    if (smallArea) formData.append("small_area", smallArea);
    if (address) formData.append("address", address);
    if (address_town) formData.append("address_town", address_town);
    if (address_chome) formData.append("address_chome", address_chome);
    if (address_banchi) formData.append("address_banchi", address_banchi);
    if (address_go) formData.append("address_go", address_go);
    if (address_building) formData.append("address_building", address_building);
  
    // 이미지
    if (images && images.length > 0) {
      formData.append("image_paths", JSON.stringify(images));
    } else {
      formData.append("image_paths", JSON.stringify([]));
    }
    
  
     // フォーム入力データ追加
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });
  
    // チェックボックス状態も全部追加
    Object.entries(formState).forEach(([key, value]) => {
      formData.append(key, value);
    });
  
    // 그 외
    formData.append("building_upper", buildingUpper);
    formData.append("building_lower", buildingLower);
    formData.append("floor_type1", floorType1);
    formData.append("floor_value1", floorValue1);
    formData.append("floor_type2", floorType2);
    formData.append("floor_value2", floorValue2);
    formData.append("whole_building", checkbox1);
    formData.append("extra_condition", extraCondition);
    formData.append("deal_type", dealType);
    formData.append("deposit_type", depositType);
    formData.append("deposit_neg", isDepositNegotiable);
    formData.append("key_money_type", keyMoneyType);
    formData.append("company_tel_1", form.company_tel_1);
    formData.append("company_tel_2", form.company_tel_2);
    formData.append("company_tel_3", form.company_tel_3);
    formData.append("company_fax_1", form.company_fax_1);
    formData.append("company_fax_2", form.company_fax_2);
    formData.append("company_fax_3", form.company_fax_3);
    formData.append("open_range", form.open_range || false);
    formData.append("customer_registration", form.customer_registration || false);
    formData.append("management_id", form.management_id || "");
  
    // ✅ 체크된 항목만 business_types 로 넣기
    formData.append("business_types", JSON.stringify(checkedBusinessTypes));
  
    // ✅ 이미지 경로도 JSON
    formData.append("image_paths", JSON.stringify(images));
  
    try {
      let res;
      if (editMode && initialForm?.id) {
        // PUT → FormData 사용 X
        // 👉 JSON 객체로 변환해서 보내기
        const jsonData = Object.fromEntries(formData);
        jsonData.business_types = JSON.stringify(checkedBusinessTypes);
        jsonData.image_paths = JSON.stringify(images);
  
        res = await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/bukken/${initialForm.id}`,
          jsonData,
          { headers: { "Content-Type": "application/json" }}
        );
      } else {
        // POST → FormData 그대로
        res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/admin/bukken`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" }}
        );
      }
  
      alert(editMode ? "物件情報が更新されました" : "物件登録が完了しました");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("登録/更新失敗:", error);
      alert("登録/更新失敗: " + (error.response?.data?.message || error.message));
    }
  };
  
  // 🍀 業態などのチェックボックス管理（親子チェック対応）
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
  
    if (groupMap[name]) {
      // 親チェック → 子も全部同じ
      const newState = { ...formState, [name]: checked };
      groupMap[name].forEach(child => newState[child] = checked);
      setFormState(newState);
    } else {
      // 子チェック → 親チェックの自動管理
      const parent = Object.entries(groupMap).find(([_, children]) => children.includes(name));
      if (parent) {
        const [parentKey, children] = parent;
        const newState = { ...formState, [name]: checked };
        const allChecked = children.every(child => child === name ? checked : formState[child]);
        newState[parentKey] = allChecked;
        setFormState(newState);
      } else {
        setFormState(prev => ({ ...prev, [name]: checked }));
      }
    }
  };

  // 🚀 編集モードのとき初期値をセット
  useEffect(() => {
    if (editMode && initialForm) {
      console.log("📝 initialForm 데이터:", initialForm);
      const [tel1, tel2, tel3] = (initialForm.company_tel || "---").split("-");
      const [fax1, fax2, fax3] = (initialForm.company_fax || "---").split("-");
      setForm(prev => ({
        ...prev,
        ...initialForm,
        deposit: initialForm.deposit || "",
        company_tel_1: tel1 || "",
        company_tel_2: tel2 || "",
        company_tel_3: tel3 || "",
        company_fax_1: fax1 || "",
        company_fax_2: fax2 || "",
        company_fax_3: fax3 || "",
        management_id: initialForm.management_id || "",
        open_range: !!initialForm.open_range,
        customer_registration: !!initialForm.customer_registration,
        rent: String(initialForm.rent ?? ""),
        m2: String(initialForm.m2 ?? ""),
        tsubo: String(initialForm.tsubo ?? ""),
        structure: initialForm.structure || "",
        deposit: initialForm.deposit_month || initialForm.deposit_yen || "",
        contract_period: String(initialForm.contract_period ?? ""),
        key_money: initialForm.key_money_month || initialForm.key_money_yen || "",
        transfer_fee: String(initialForm.transfer_fee ?? ""),
        maintenance: String(initialForm.maintenance ?? ""),
        prev_tenant: initialForm.prev_tenant || "",
        amortization: initialForm.amortization || "",
        renewal_fee: String(initialForm.renewal_fee ?? ""),
        built_year: String(initialForm.built_year ?? ""),
        state: initialForm.state || "",
        remarks: initialForm.remarks || "",
        coment: initialForm.coment || "",
        company: initialForm.company || "",
        contact: initialForm.contact || "",
        memo: initialForm.memo || "",
        station1: initialForm.station1 || "",
        station2: initialForm.station2 || "",
        station3: initialForm.station3 || "",
        station4: initialForm.station4 || "",
        station5: initialForm.station5 || "",
        station1_walk: String(initialForm.station1_walk ?? ""),
        station1_bus: String(initialForm.station1_bus ?? ""),
        station2_walk: String(initialForm.station2_walk ?? ""),
        station2_bus: String(initialForm.station2_bus ?? ""),
      }));
  
      setBuildingUpper(String(initialForm.building_upper ?? ""));
      setBuildingLower(String(initialForm.building_lower ?? ""));
      setFloorType1(initialForm.floor_type1 || "地上");
      setFloorValue1(String(initialForm.floor_value1 ?? ""));
      setFloorType2(initialForm.floor_type2 || "地上");
      setFloorValue2(String(initialForm.floor_value2 ?? ""));
      setCheckbox1(!!initialForm.whole_building);
      setExtraCondition(!!initialForm.extra_condition);
      setDealType(initialForm.deal_type || "ippan_baikai");
      setDepositType(initialForm.deposit_month ? "month" : "yen");
      setIsDepositNegotiable(initialForm.deposit_neg || false);
      setSelectedState(initialForm.state || "");
      setisTransferNegotiable(initialForm.transfer_neg || false);
      setKeyMoneyType(initialForm.key_money_month ? "month" : "yen");
      setSelectedState(initialForm.state || "");
  
      // 체크박스 항목 초기화
      const checkboxKeys = [
        "food_light", "food_heavy", "food_bar", 
        "beauty_sal", "beauty_sub1",
        "salon_est", "salon_esthe", "salon_nail", "salon_other",
        "clinic", "clinic_c", "clinic_dent", "clinic_pharm", "clinic_other",
        "retail", "retail_app", "retail_conv", "retail_other",
        "gym", "gym_studio", "gym_gym", "gym_class", "gym_school",
        "other_service", "other_store"
      ];
      const initCheck = {};
      checkboxKeys.forEach(key => {
        initCheck[key] = initialForm.business_types?.[key] === true; 
      })
      setFormState(initCheck);
    }
  }, [editMode, initialForm]);
  
  
  
  useEffect(() => {
    console.log("1ページからのstate : " , location.state);
    const sects = document.querySelectorAll(".sect");
    sects.forEach(sect => {
      const header = sect.querySelector(".sect-header");
      const checkboxes = sect.querySelectorAll("input[type='checkbox']");
      const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
      if (header) {
        header.classList.toggle("filled", anyChecked);
      }
    });
  }, [formState]);

  // 🚀 ピンク入力欄 filled処理 + 登録可否判定
  useEffect(() => {
    const pinkContainers = document.querySelectorAll(".pink, .pink-short, .pink-medium, .station1");
  
    pinkContainers.forEach(container => {
      const inputs = container.querySelectorAll("input, textarea, select");
      const anyFilled = Array.from(inputs).some(
        input => input.type === "checkbox" ? input.checked : input.value.trim() !== ""
      );
      // 値が1つでもあれば、.filled追加、もしくは削除
      if (anyFilled) {
        container.classList.add("filled");
      } else {
        container.classList.remove("filled");
      }
    });

      
    // 登録可否の判断 (テキスト入力必須フィールドのみ)
    const requiredFields = document.querySelectorAll("input[class*='pink'], input.station1, textarea[class*='pink']");
    let allFilled = true;
    requiredFields.forEach((el) => {
      if (el.value.trim() === "") {
        el.classList.remove("filled");
        allFilled = false;
      } else {
        el.classList.add("filled");
      }
    });

    const anyIndustryChecked = Object.keys(formState).some(key => formState[key] === true);
    setCanSubmit(allFilled && anyIndustryChecked);
  }, [formState, form]);
  

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type==='checkbox' ? checked : value }));
    console.log("handleChange name, value : ",  name, value)
  };
  
  // 🚧 1つ目の階数の種類を変更（地上/地下）
  const handleFloorType1Change = (e) => {
    const type = e.target.value;
    setFloorType1(type);
    // 地下または階数が2以上の場合、専用階段のチェックボックスを表示
    setShowExtraCheckbox(type === "地下" || parseInt(floorValue1) > 1);
  };

  // 🚧 1つ目の階数の値を変更
  const handleFloorValue1Change = (e) => {
    const val = e.target.value;
    setFloorValue1(val);
    // 地下または階数が2以上の場合、専用階段のチェックボックスを表示
    setShowExtraCheckbox(floorType1 == "地下" || parseInt(val) > 1);
  }
  
  // 🚧 2つ目の階数の種類を変更（地上/地下）
  const handleFloorType2Change = (e) => {
    const type = e.target.value;
    setFloorType2(type);
  }

  // 🚧 2つ目の階数の値を変更
  const handleFloorValue2Change = (e) => {
    const val = e.target.value;
    setFloorValue2(val);
  }
  
  // 🚧 「一括貸し」のチェック切替
  const handleCheckbox1Change = (e) => {
    const checked = e.target.checked;
    setCheckbox1(checked);
    setEnableSecond(checked);
    // チェックを外した場合は2つ目の階数入力をリセット
    if (!checked) {
      setFloorValue2("");
    }
  };

  // 🚧 「専用階段がある場合」のチェック切替
  const handleExtraConditionChange = (e) => {
    setExtraCondition(e.target.checked);
  }
  

  return (
    <div className="detail-container">
      <h2>物件詳細情報</h2>
      <p className="note-required">※ ピンク色の項目は必須入力です。</p>
      <form>
        <table className="detail-table">
          <tbody>
            <tr>
              <th>
                所在地
                <p className='detail-font'>サイトは丁目まで <br/>所在地を表示します</p>
                </th>
                <td colSpan="3" style={{ verticalAlign: "middle" }}>{displayAddress}</td>
            </tr>
            <tr>
              <th>
                最寄駅
                <p className='detail-font'>最寄駅を入力し、表<br/>示される候補から駅・<br/>路線を選択してください</p>
                <AdminTooltip
                    title="最寄り駅"
                    text={
                        <>
                        直接入力の場合、最寄り駅の一部を入力すると候補の駅・路線が選択できますが、駅・路線が決定されません。必ず選択して下さい。<br />
                        検索用駅はサイトには表示されません。
                        </>
                    }
                />
              </th>
              <td colSpan="3">
                <input name="station1" className="station1" placeholder="" value={form.station1} onChange={handleChange} required /> 駅　徒歩 
                <input name='station1_walk' className="tiny" value={form.station1_walk} onChange={handleChange} type='number'/> 分　バス 
                <input name='station1_bus' className="tiny" value={form.station1_bus} onChange={handleChange} type='number'/> 分<br/>
                <input name="station2" className="station" placeholder="" value={form.station2} onChange={handleChange}/> 駅　徒歩 
                <input name='station2_walk' className="tiny" value={form.station2_walk} onChange={handleChange} type='number'/> 分　バス 
                <input name='station2_bus' className="tiny" value={form.station2_bus} onChange={handleChange} type='number'/> 分
                <p className='station-note'>※最寄り駅が3駅以上ある場合はご入力ください(検索にかかりますが、サイトには表示されません)</p>
                <input name="station3" className="station" placeholder="" value={form.station3} onChange={handleChange} /> 駅　
                <input name="station4" className="station" placeholder="" value={form.station4} onChange={handleChange} /> 駅　
                <input name="station5" className="station" placeholder="" value={form.station5} onChange={handleChange} /> 駅　 
              </td>
            </tr>
            <tr>
                <th rowSpan="2">
                    賃料
                    <AdminTooltip
                    title="賃料"
                    text={`単位は万円です。相談にチェックした場合は、サイト上にも相談と表記します。`}
                    />
                </th>
                <td rowSpan="2">
                    <input maxLength="8" type='number' min="0" name="rent" value={form.rent} className={`pink-medium ${isRentNegotiable ? "disabled-input" : ""}`} 
                    onChange={handleChange}
                    disabled={isRentNegotiable}/> 万円 <br />
                    <label>
                    <input
                        type="checkbox"
                        name="rent_negotiable"
                        onChange={(e) => {
                            handleChange(e);
                            setIsRentNegotiable(e.target.checked);
                        }}
                    />
                    相談の場合はチェック
                    </label>
                </td>
                <th>建物</th>
                <td>
                    地上 <input maxLength="3" type='number' min='0' name="building_upper" className="short" 
                        value={buildingUpper} onChange={(e) => setBuildingUpper(e.target.value)} /> 階　
                    地下 <input maxLength="3" type='number' min='0' name="building_lower" className="short"
                        value={buildingLower} onChange={(e) => setBuildingLower(e.target.value)} /> 階建
                </td>
            </tr>
            <tr>
                <th>階数</th>
                <td>
                    <select name='floor_type1' value={floorType1} onChange={handleFloorType1Change}>
                    <option value="地上">地上</option>
                    <option value="地下">地下</option>
                    </select>
                    <input
                    name="floor_value1"
                    type='number' min="0"
                    className={`pink-short ${floorValue1.trim() !== '' ? 'filled' : ''}`}
                    value={floorValue1}
                    onChange={handleFloorValue1Change}
                    />
                    階
                    <select name='floor_type2' value={floorType2} onChange={handleFloorType2Change} disabled={!enableSecond}>
                    <option value="地上">地上</option>
                    <option value="地下">地下</option>
                    </select>
                    <input
                    name="floor_value2"
                    type='number'
                    min="0"
                    className="tiny"
                    value={floorValue2}
                    onChange={handleFloorValue2Change}
                    disabled={!enableSecond}
                    />
                    階
                    <br />
                    <label>
                    <input
                        type="checkbox"
                        name="whole_building"
                        checked={checkbox1}
                        onChange={handleCheckbox1Change}
                    />
                    一括貸しの場合はチェック
                    </label>

                    {showExtraCheckbox && (
                    <div className="mt-2">
                        <label>
                        <input type="checkbox" name="extra_condition" checked={extraCondition} onChange={handleExtraConditionChange} />
                        専用階段がある場合はチェック
                        </label>
                    </div>
                    )}
                </td>
            </tr>
            <tr>
            <th>
                面積・坪
                <p className='detail-font'>どちらか必須</p>
                <AdminTooltip
                    title="面積・坪"
                    text={`m²・坪のどちらか一方を入力するともう一方は自動計算されます。`}
                />
              </th>
              <td className="">
                <input name="m2" type='number' min='0' className="pink-medium" value={form.m2} onChange={handleChange}/>㎡　
                <input name="tsubo" type='number' min='0' className="pink-medium" value={form.tsubo} onChange={handleChange}/>坪
              </td>
              <th>構造</th>
              <td><input name="structure" className="long" value={form.structure} onChange={handleChange}/> 造</td>
            </tr>
            <tr>
              <th>
                保証金・敷金
                <AdminTooltip
                    title="保証金・敷金"
                    text={`単位は「ヶ月」と「万円」が選択できます。相談にチェックした場合は、サイト上にも相談と表記します。`}
                />
                </th>
              <td><input name="deposit" type='number' min='0' value={form.deposit}
              className={`medium ${isDepositNegotiable ? "disabled-input" : ""}`}
              onChange={handleChange}
              readOnly={isDepositNegotiable}/>  
              <select name="deposit_type" className='selectBox' value={depositType}
              onChange={(e) => {
                handleChange(e);
                setDepositType(e.target.value);
              }}
              >
                <option value="month">ヶ月</option>
                <option value="yen">万円</option>
                </select><br/><label>
              <input type="checkbox" name="deposit_neg"
              checked={isDepositNegotiable}
              onChange={(e) => {
                handleChange(e);
                setIsDepositNegotiable(e.target.checked); 
              }}/> 相談の場合はチェック</label>
              </td>
              <th>契約期間</th>
              <td><input name="contract_period" type='number' min='0' value={form.contract_period} className="medium" onChange={handleChange}/></td>
            </tr>
            <tr>
              <th rowSpan="2">
                権利金・礼金
                <AdminTooltip
                    title="権利金・礼金"
                    text={`単位は「ヶ月」と「万円」が選択できます。相談にチェックした場合は、サイト上にも相談と表記します。`}
                />
              </th>
              <td rowSpan="2">
                <input name="key_money" type='number' min='0' value={form.key_money}
                className={`medium ${isKeyMoneyNegotiable ? "disabled-input" : ""}`} 
                onChange={handleChange} 
                readOnly={isKeyMoneyNegotiable} /> 
                <select className='selectBox' name='key_money_type' value={keyMoneyType}
                onChange={(e) => {
                  handleChange(e);
                  setKeyMoneyType(e.target.value);
                }}>
                    <option value="month">ヶ月</option>
                    <option value="yen">万円</option>
                    </select><br/><label>
                <input type="checkbox" name="key_money_neg" 
                checked={isKeyMoneyNegotiable}
                onChange={(e) => {
                    handleChange(e);
                    setIsKeyMoneyNegotiable(e.target.checked)
                }}/> 
                相談の場合はチェック</label>
              </td>
              <th>物件の状態</th>
              <td className={`pink ${selectedState ? "filled" : ""}`}>
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="skeleton"
                    checked={selectedState === "skeleton"}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedState(e.target.value);
                    }}
                  /> スケルトン
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="state"
                    value="inuki"
                    checked={selectedState === "inuki"}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectedState(e.target.value);
                    }}
                  /> 居抜き（造作付の引渡しが可能）
                </label>
              </td>

            </tr>
            <tr>
              <th>造作譲渡料
                <p>(居抜きのみ入力可)</p>
              </th>
              <td>
                <input name="transfer_fee" type='number' min='0' value={form.transfer_fee}
                className={`short ${selectedState === "inuki" && !isTransferNegotiable ? "" : "disabled-input"}`} 
                onChange={handleChange}
                readOnly={selectedState !== "inuki" || isTransferNegotiable}/> 万円 <br/><label>
                <input type="checkbox" name="transfer_neg" 
                onChange={(e) => {
                    handleChange(e);
                    setisTransferNegotiable(e.target.checked)
                }}/> 相談の場合はチェック</label>
              </td>
            </tr>
            <tr>
              <th rowSpan="2">共益・管理費</th>
              <td rowSpan="2">
                <input name="maintenance" type='number' min='0' value={form.maintenance}
                className={`medium ${isMaintNegotiable ? "disabled-input" : "" }`}
                onChange={handleChange}
                readOnly={isMaintNegotiable}/> 円/月 <br/><label>
                <input type="checkbox" name="maint_neg" 
                onChange={(e) => {
                    handleChange(e);
                    setIsMaintNegotiable(e.target.checked);
                }}/> 相談の場合はチェック</label>
              </td>
              <th>前テナントの業態<span className="tooltip">？<span className="tooltiptext">例：レストラン等</span></span></th>
              <td><input name="prev_tenant" className="long" value={form.prev_tenant} onChange={handleChange}/></td>
            </tr>
            <tr>
              <th>償却</th>
              <td><input name="amortization" className="max" value={form.amortization} onChange={handleChange}/></td>
            </tr>
            <tr>
              <th>更新料</th>
              <td><input name='renewal_fee' type='number' min='0' className='long' value={form.renewal_fee} onChange={handleChange}></input></td>
              <th>築年</th>
              <td><input name="built_year" type='number' min='0' className="short" value={form.built_year} onChange={handleChange}/> 年築</td>
            </tr>
            <tr>
                <th>
                  取引態様
                  <AdminTooltip
                      title="取引態様"
                      text={
                        <>
                        「貸主」「代理」「専任」「専任媒介」「一般」のいずれかを選択してください。< br/>
                        「貸主」以外の場合、サイトにはすべて「媒介」と表示します。
                        </>
                      }
                  />
                  </th>
                  <td colSpan="3">
                    <select name="deal_type" value={dealType} onChange={(e) => {
                      setDealType(e.target.value);
                      handleChange(e)
                    }}>
                        <option value="kashinushi">貸主</option>
                        <option value="dairi">代理</option>
                        <option value="senzoku">専属</option>
                        <option value="sennin">専任</option>
                        <option value="ippan_baikai">一般</option>
                    </select>
                  </td>
            </tr>
            
            
            
            <tr>
              <th>
                出店可能な業態
                <AdminTooltip
                    title="出店可能な飲食店の種類"
                    text={
                    <>
                        軽飲食…カフェなど火気をあまり使用しない業態が可能<br />
                        重飲食…一般的な飲食業態<br />
                        バー・クラブ…スナック・カラオケなども含む音の出る業態
                    </>
                    }
                />
                </th>
                <td colSpan="3" className="pink" onChange={handleChange}>
                  <div className="industry-wrap">
                    <div className="sect">
                    <div className='sect-header'>飲食店</div>
                    <div className="checkbox-group" onChange={handleCheckboxChange}>
                        <label><input type="checkbox" name="food_light"
                        checked={formState["food_light"] || false}/> 
                        軽飲食</label>
                        <label><input type="checkbox" name="food_heavy"
                        checked={formState["food_heavy"] || false}/>
                        重飲食</label>
                        <label><input type="checkbox" name="food_bar"
                        checked={formState["food_bar"] || false}
                        />バー・クラブ</label>
                    </div>
                    </div>

                    <div className="sect">
                    <div className='sect-header'>飲食店以外</div>
                    <div className="sub-sect" onChange={handleCheckboxChange}>
                        <label>
                        <input type="checkbox" name="beauty_sal" 
                        checked={formState["beauty_sal"] || false}/> {" "} 
                        <strong>美容室・理容室</strong>
                        </label>
                        <div className="checkbox-group">
                        <label>
                        <input type="checkbox" name="beauty_sub1"
                        checked={formState["beauty_sub1"] || false} /> {" "} 
                        美容室・理容室
                        </label>
                        </div>
                    </div>

                    <div className="sub-sect" onChange={handleCheckboxChange}>
                        <label>
                            <input type="checkbox" name="salon_est" 
                            checked={formState["salon_est"] || false}/> {" "} 
                            <strong>サロン</strong>
                            </label>
                        <div className="checkbox-group">
                        <label><input type="checkbox" name="salon_esthe" 
                        checked={formState["salon_esthe"] || false} /> {" "} 
                         エステサロン
                         </label>
                        <label>
                            <input type="checkbox" name="salon_nail" 
                            checked={formState["salon_nail"] || false}/> {" "} ネイルサロン
                            </label>
                        <label>
                            <input type="checkbox" name="salon_other"
                            checked={formState["salon_other"] || false}/> {" "}その他（サロン）
                            </label>
                        </div>
                    </div>

                    <div className="sub-sect" onChange={handleCheckboxChange}>
                        <label>
                            <input type="checkbox" name="clinic"
                            checked={formState["clinic"] || false}/> {" "} 
                            <strong>医療・歯科・クリニック</strong>
                            </label>
                        <div className="checkbox-group">
                        <label><input type="checkbox" name="clinic_c" 
                        checked={formState["clinic_c"] || false}/> {" "}クリニック</label>
                        <label><input type="checkbox" name="clinic_dent"
                        checked={formState["clinic_dent"] || false}/> {" "}歯科</label>
                        <label><input type="checkbox" name="clinic_pharm"
                        checked={formState["clinic_pharm"] || false}/> {" "}薬局</label>
                        <label><input type="checkbox" name="clinic_other"
                        checked={formState["clinic_other"] || false}/> {" "}その他（医療系）</label>
                        </div>
                    </div>

                    <div className="sub-sect" onChange={handleCheckboxChange}>
                        <label><input type="checkbox" name="retail"
                        checked={formState["retail"] || false}/> {" "}<strong>物販・小売</strong></label>
                        <div className="checkbox-group">
                        <label><input type="checkbox" name="retail_app"
                        checked={formState["retail_app"] || false}/> {" "}物販・アパレル</label>
                        <label><input type="checkbox" name="retail_conv"
                        checked={formState["retail_conv"] || false}/> {" "}コンビニ</label>
                        <label><input type="checkbox" name="retail_other"
                        checked={formState["retail_other"] || false}/> {" "}その他（小売）</label>
                        </div>
                    </div>

                    <div className="sub-sect" onChange={handleCheckboxChange}>
                        <label><input type="checkbox" name="gym"
                        checked={formState["gym"] || false}/> {" "}<strong>ジム・教室・スタジオ</strong></label>
                        <div className="checkbox-group">
                        <label><input type="checkbox" name="gym_studio"
                        checked={formState["gym_studio"] || false}/> {" "}スタジオ</label>
                        <label><input type="checkbox" name="gym_gym"
                        checked={formState["gym_gym"] || false}/> {" "}ジム</label>
                        <label><input type="checkbox" name="gym_class"
                        checked={formState["gym_class"] || false}/> {" "}教室</label>
                        <label><input type="checkbox" name="gym_school"
                        checked={formState["gym_school"] || false}/> {" "}その他（スクール）</label>
                        </div>
                    </div>

                    <div className="sub-sect" onChange={handleCheckboxChange}>
                        <label><input type="checkbox" name="other_service"
                        checked={formState["other_service"] || false}/> {" "}<strong>その他サービス・その他</strong></label>
                        <div className="checkbox-group">
                        <label><input type="checkbox" name="other_store"
                        checked={formState["other_store"] || false}/> {" "}その他店舗物件</label>
                        </div>
                    </div>
                    </div>
                  </div>
                </td>
            </tr>
            <tr>
              <th>備考
              <AdminTooltip
                    title="権利金・礼金"
                    text={`単位は「ヶ月」と「万円」が選択できます。相談にチェックした場合は、サイト上にも相談と表記します。`}
                />
                </th>
              <td colSpan="3">
                <textarea name="remarks" rows="3" className="max" value={form.remarks} onChange={handleChange}></textarea> <br/>
                <span>※不動産の表示に関する公正競争規約に反する表現などは削除させていただく場合があります。</span><br/> 
                <span className='red'>※貴社と直接連絡がとれる情報（電話番号、メールアドレスなど）のご入力はお控えください。物件情報を削除させて<br/> いただく場合があります。</span>    
              </td>
            </tr>
            <tr>
                <th>一覧コメント
                  <AdminTooltip
                    title = "一覧コメント"
                    text = {`ユーザーが閲覧する物件一覧画面の見出しとして表示されます。（40文字まで）`}
                  />
                </th>
                <td colSpan="3">
                    <input name="coment" className='max' value={form.coment} onChange={handleChange}></input> <br/>
                    <span>※不動産の表示に関する公正競争規約に反する表現などは削除させていただく場合があります。</span><br/>
                    <span className='red'>※貴社と直接連絡がとれる情報（電話番号、メールアドレスなど）のご入力はお控えください。物件情報を削除させて<br/>いただく
                            場合があります。</span>
                </td>
            </tr>
            <tr>
               <th> 管理元不動産会社名
                <AdminTooltip
                    title="管理元不動産会社名"
                    text={`管理元不動産会社の情報はミリネグローバル会員には公開されません。貴社の管理用としてご利用ください。`}
                />
               </th> 
               <td>
                <input name='company' className='long' value={form.company} onChange={handleChange}></input>
               </td>
               <th> 管理元担当者名</th>
                <td>
                    <input name='contact' className='long' value={form.contact} onChange={handleChange}></input>
                </td>
               
            </tr>
            <tr>
              <th>管理元電話番号</th>
              <td><input name='company_tel_1' type='text' value={form.company_tel_1} onChange={handleChange} className='tiny' /> 
                  <span className='hypen'>-</span>
                  <input name='company_tel_2' type='text' value={form.company_tel_2} onChange={handleChange} className='tiny' /> 
                  <span className='hypen'>-</span>
                  <input name='company_tel_3' type='text' value={form.company_tel_3} onChange={handleChange} className='tiny' /> 
             </td>
              <th>管理元FAX番号</th>
              <td><input name='company_fax_1' type='text' value={form.company_fax_1} onChange={handleChange} className='tiny' /> 
                  <span className='hypen'>-</span>
                  <input name='company_fax_2' type='text' value={form.company_fax_2} onChange={handleChange} className='tiny' /> 
                  <span className='hypen'>-</span>
                  <input name='company_fax_3' type='text' value={form.company_fax_3} onChange={handleChange} className='tiny' /> 
             </td>
            </tr>
            <tr>
                <th>物件メモ
                    <AdminTooltip
                        title="物件メモ"
                        text={`貴社内のメモとしてご利用ください。ミリネグローバル会員には公開されません。`}
                    />
                </th>
                <td colSpan="3">
                    <textarea name='memo' className='max' value={form.memo} onChange={handleChange}></textarea>
                </td>
            </tr>
            <tr>
                <th>公開範囲
                    <AdminTooltip
                        title="公開範囲"
                        text={`有料でご利用中の確度の高いミリネグローバル会員（400名程度）のみに物件情報が公開されます。問い合わせを限定したい時以外は使用しないでください。`}
                    />
                </th>
                <td colSpan="3">
                    <input type='checkbox' name='open_range' onChange={handleChange} checked={form.open_range || false} ></input> プレミアム会員にのみ公開
                </td>
            </tr>
            <tr>
            <th>物件管理ID
                    <AdminTooltip
                        title="物件管理ID"
                        text={`貴社で別途、物件番号の管理をしている場合にご利用ください。ミリネグローバル会員には公開されません。`}
                    />
                </th>
                <td colSpan="3">
                    <input name='management_id' className='long' onChange={handleChange} value={form.management_id || ''} ></input>
                </td>
            </tr>
            <tr>
                <th>客付け登録</th>
                <td colSpan="3">
                <input type='checkbox' name='customer_registration' onChange={handleChange} checked={form.customer_registration || false}></input> 客付け可能物件として登録する<br/>
                <p className='red'>チェックを入れると、ミリネグローバルの不動産会社が物件概要を確認することができるようになります 。<br/>客付け可能な物件の場合は登録をお願いします。</p>
                </td>   
            </tr>        
            
    
                
            
          </tbody>
        </table>
        <div className="btn-area">
          <button type="submit" onClick={handleSubmit} disabled={!canSubmit}>
            {editMode ? "物件情報を更新する" : "画像登録画面へ"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminBukkenRegisterStep2;
