import { useState } from "react";

interface CustomSelectOption {
  label: string;
  value: string | number;
}

interface UseCustomSelectReturn {
  isOpen: boolean;
  selectedOption: CustomSelectOption | null;
  options: CustomSelectOption[];
  openDropdown: () => void;
  closeDropdown: () => void;
  toggleDropdown: () => void;
  selectOption: (option: CustomSelectOption) => void;
}

const useCustomSelect = (
  initialOptions: CustomSelectOption[],
  isOpenByDefault: boolean = false
): UseCustomSelectReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(isOpenByDefault);
  const [selectedOption, setSelectedOption] = useState<CustomSelectOption | null>(null);
  const options = initialOptions;

  const openDropdown = () => setIsOpen(true);
  const closeDropdown = () => setIsOpen(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const selectOption = (option: CustomSelectOption) => {
    setSelectedOption(option);
    closeDropdown();
  };

  return {
    isOpen,
    selectedOption,
    options,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    selectOption,
  };
};

export default useCustomSelect;
