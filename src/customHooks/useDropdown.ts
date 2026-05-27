import { useState } from "react";

// Generic type T for dropdown option values
function useDropdown<T>(initialValue: T, options: T[] = []) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<T>(initialValue);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleOptionSelect = (option: T) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
  };

  return {
    isDropdownOpen,
    selectedOption,
    toggleDropdown,
    handleOptionSelect,
    options,
  };
}

export default useDropdown;
