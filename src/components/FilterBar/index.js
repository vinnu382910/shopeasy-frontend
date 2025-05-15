import { useState, useEffect, useCallback, useRef } from 'react';
import { Sliders, X, Star, ChevronDown, ChevronUp, Search, XCircle } from 'lucide-react';
import './FilterBar.css';

const FilterBar = ({ 
  onApplyFilters, 
  categories = [], 
  initialFilters = {} 
}) => {
  const DEFAULT_MAX_PRICE = 1000000;
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, DEFAULT_MAX_PRICE]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);

  // Predefined categories
  const predefinedCategories = [
    'Electronics',
    'Clothing',
    'Kitchen',
    'Accessories',
    'Footwear',
    'Home'
  ];

  // Initialize with default or provided filters
  useEffect(() => {
    if (initialFilters) {
      setPriceRange([
        initialFilters.minPrice || 0,
        initialFilters.maxPrice || DEFAULT_MAX_PRICE
      ]);
      setSelectedCategory(initialFilters.category || '');
      setMinRating(initialFilters.minRating || 0);
      setSearchQuery(initialFilters.q || '');
    }
  }, [initialFilters]);

  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      onApplyFilters({
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        category: selectedCategory,
        minRating,
        q: query
      });
    }, 500);
  }, [priceRange, selectedCategory, minRating, onApplyFilters]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onApplyFilters({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      category: selectedCategory,
      minRating,
      q: ''
    });
  }, [priceRange, selectedCategory, minRating, onApplyFilters]);

  const handlePriceChange = (e, index) => {
    const newValue = parseInt(e.target.value);
    const newRange = [...priceRange];
    newRange[index] = newValue;
    
    if (index === 0 && newValue > priceRange[1]) {
      newRange[1] = newValue;
    } else if (index === 1 && newValue < priceRange[0]) {
      newRange[0] = newValue;
    }
    
    setPriceRange(newRange);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const applyFilters = () => {
    const filters = {
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      category: selectedCategory,
      minRating,
      q: searchQuery
    };
    onApplyFilters(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    setPriceRange([0, DEFAULT_MAX_PRICE]);
    setSelectedCategory('');
    setMinRating(0);
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onApplyFilters({
      minPrice: 0,
      maxPrice: DEFAULT_MAX_PRICE,
      category: '',
      minRating: 0,
      q: ''
    });
    setIsOpen(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`filter-container ${isOpen ? 'open' : ''}`}>
      <div className='filters-container'>
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
                onApplyFilters({
                  minPrice: priceRange[0],
                  maxPrice: priceRange[1],
                  category: selectedCategory,
                  minRating,
                  q: searchQuery
                });
              }
            }}
          />
          {searchQuery && (
            <button 
              className="clear-search-button" 
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
        <button 
          className="filter-toggle-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Sliders size={18} />
          <span>Filters</span>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {isOpen && (
          <div className="filter-sidebar">
            <div className="filter-header">
              <h3>Filter Products</h3>
              <button onClick={() => setIsOpen(false)} className="close-button">
                <X size={20} />
              </button>
            </div>

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-range-display">
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </div>
              <div className="range-inputs">
                <input
                  type="range"
                  min="0"
                  max={DEFAULT_MAX_PRICE}
                  step={DEFAULT_MAX_PRICE/100}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                />
                <input
                  type="range"
                  min="0"
                  max={DEFAULT_MAX_PRICE}
                  step={DEFAULT_MAX_PRICE/100}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                />
              </div>
            </div>

            <div className="filter-section">
              <div className="section-header" onClick={() => setShowCategories(!showCategories)}>
                <h4>Categories</h4>
                {showCategories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {showCategories && (
                <div className="category-options">
                  {predefinedCategories.map(category => (
                    <label key={category} className="category-option">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-section">
              <h4>Minimum Rating</h4>
              <div className="rating-options">
                {[4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    className={`rating-option ${minRating === rating ? 'selected' : ''}`}
                    onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < rating ? "#ffb400" : "none"}
                        stroke="#ffb400"
                      />
                    ))}
                    & Up
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={resetFilters} className="reset-button">
                Reset All
              </button>
              <button onClick={applyFilters} className="apply-button">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      {isOpen && <div className="filter-overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default FilterBar;