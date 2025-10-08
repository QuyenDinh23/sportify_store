import { useEffect, useState } from "react";
import { addressApi } from "../services/addressApi";

export const useAddress = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // 🔹 Lấy danh sách tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await addressApi.getProvines();
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  // 🔹 Khi chọn tỉnh → load quận
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvince) return;
      const allDistricts = await addressApi.getDistricts();
      const filtered = allDistricts.filter(
        (d) => Number(d.province_code) === Number(selectedProvince)
      );
      setDistricts(filtered);
      setWards([]); // reset phường
      setSelectedDistrict("");
      setSelectedWard("");
    };
    fetchDistricts();
  }, [selectedProvince]);

  // 🔹 Khi chọn quận → load phường
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrict) return;
      const allWards = await addressApi.getWards();
      const filtered = allWards.filter(
        (w) => Number(w.district_code) === Number(selectedDistrict)
      );
      setWards(filtered);
      setSelectedWard("");
    };
    fetchWards();
  }, [selectedDistrict]);

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
  };
};
