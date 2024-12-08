import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getAutocompleteResults, getPopularMovies } from "../api";

// 스타일 정의

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Search = styled.form`
  color: ${(props) => props.theme.blue.darker};
  display: flex;
  justify-content: flex-start;

  margin-top: 40px;
  gap: 4px;
  position: relative;
  cursor: pointer;
  svg {
    width: 18px;
    height: 18px;
    fill: ${(props) => props.theme.blue.darker};
  }
`;

const SearchBar = styled(motion.input)`
  border-radius: 20px;
  padding: 10px 20px;
  width: 300px;
  font-size: 14px;
  text-align: center;
  border: none;
  &:focus {
    outline: none;
  }
`;

const SuggestionsList = styled.ul`
  display: flex;
  flex-direction: column;
  border: 1px solid ${(props) => props.theme.blue.darker};
  position: absolute;
  top: 140%;
  left: 0;
  width: 100%;
  background: ${(props) => props.theme.black.lighter};
  border-radius: 4px;
  margin: 0;
  padding: 0;
  z-index: 100;

  li {
    font-size: 14px;
    padding: 8px;
    cursor: pointer;
    color: ${(props) => props.theme.white.lighter};
    &:hover {
      background: ${(props) => props.theme.blue.darker};
    }
  }
`;

const PopularMoviesList = styled.ul`
  width: 100%;
  margin-top: 40px;
  padding: 0 40px;

  li {
    font-size: 16px;
    padding: 10px 0;
    cursor: pointer;
    color: #939393;

    &:hover {
      color: ${(props) => props.theme.blue.lighter};
    }
  }
`;

const PopularTitle = styled.p`
  color: #fff;
  margin-bottom: 20px;
`;

const SearchBarComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: number; title?: string; name?: string }[]
  >([]);
  const [popularMovies, setPopularMovies] = useState<
    { id: number; title: string }[]
  >([]);
  const navigate = useNavigate();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const results = await getPopularMovies();
        setPopularMovies(results.slice(0, 10));
      } catch (error) {
        console.error("Error fetching popular movies:", error);
      }
    };
    fetchPopularMovies();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm.trim()) {
        return;
      }

      try {
        const results = await getAutocompleteResults(searchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching autocomplete results:", error);
      }
    };

    typingTimeoutRef.current = setTimeout(fetchSuggestions, 300);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSuggestionClick = (suggestion: { id: number }) => {
    navigate(`/movies/${suggestion.id}`);
    setSearchTerm("");
    setSuggestions([]);
  };

  const handlePopularMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?keyword=${searchTerm.trim()}`);
      setSearchTerm("");
      setSuggestions([]);
    }
  };

  return (
    <Wrapper>
      <Search onSubmit={handleSearchSubmit}>
        <SearchBar
          type="text"
          placeholder="찾으시는 검색어를 입력해주세요🔍"
          value={searchTerm}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && (
          <SuggestionsList>
            {suggestions.map((item) => (
              <li key={item.id} onClick={() => handleSuggestionClick(item)}>
                {item.title || item.name || "Unknown"}
              </li>
            ))}
          </SuggestionsList>
        )}
      </Search>

      {popularMovies.length > 0 && (
        <PopularMoviesList>
          <PopularTitle>🎥실시간 인기 영화</PopularTitle>
          {popularMovies.map((movie, index) => (
            <li
              key={movie.id}
              onClick={() => handlePopularMovieClick(movie.id)}
            >
              {index + 1}. {movie.title}
            </li>
          ))}
        </PopularMoviesList>
      )}
    </Wrapper>
  );
};

export default SearchBarComponent;
