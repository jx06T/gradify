import React, { useState, useRef, useEffect } from 'react';
// import { ChevronDown, X } from 'lucide-react';

const CustomSelect = ({
    options = [],
    placeholder = "Select or type...",
    onChange = (value: string) => { },
    initialValue = "",
    className = "",
    maxH = 120,
}: { maxH?: number, options: { label: string, value: string }[], placeholder: string, onChange: Function, initialValue: string, className?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialValue);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            //@ts-ignore
            if (wrapperRef.current && !wrapperRef.current!.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (inputValue) {
            const filtered = options.filter((option: { label: string, value: string }) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredOptions(filtered);
        } else {
            setFilteredOptions(options);
        }
    }, [inputValue, options]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleOptionClick = (option: string) => {
        setInputValue(option);
        onChange(option);
        // setInputValue("")
        setIsOpen(false);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            // setInputValue("")
            setIsOpen(false);
            onChange(inputValue);
        }
    };
    return (
        <div ref={wrapperRef} className={"w-full max-w-md relative pt-1 text-lg " + className} >
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onKeyDown={handleKeyDown}
                    onChange={handleInputChange}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder || inputValue}
                    className=" outline-none w-full h-8 px-4 py-4 border-gray-500 border-2 bg-transparent rounded-md focus:outline-none"
                />
            </div>

            {
                isOpen && (
                    <div className=" outline-none absolute z-10 w-full mt-1 bg-gray-50  rounded-l-lg rounded-r-md shadow-lg overflow-auto"
                        style={{ maxHeight: maxH + 'px' }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleOptionClick(option.value)}
                                    className="px-4 py-2 cursor-pointer bg-gray-50 hover:bg-gray-100"
                                >
                                    {option.label}
                                    {/* <hr className=' black'/> */}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500 cursor-pointer"
                                onClick={() => {
                                    onChange(inputValue);
                                    setIsOpen(false)
                                }}>
                                {inputValue}{"（new）"}
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default CustomSelect;