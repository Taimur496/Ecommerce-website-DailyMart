import React, { useState, useCallback } from "react";
import { productAPI, sliderAPI } from "../services/api";
import { DataCacheContext } from "./DataCacheContext";

export const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    featuredProducts: { data: null, timestamp: null },
    hotDeals: { data: null, timestamp: null },
    specialDeals: { data: null, timestamp: null },
    categories: { data: null, timestamp: null },
    brands: { data: null, timestamp: null },
    products: { data: null, timestamp: null },
    subCategories: { data: null, timestamp: null },
    sliders: { data: null, timestamp: null },
  });

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = (timestamp) => {
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchFeaturedProducts = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.featuredProducts.data &&
        isCacheValid(cache.featuredProducts.timestamp)
      ) {
        return cache.featuredProducts.data;
      }

      try {
        const response = await productAPI.getFeatured();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            featuredProducts: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
        throw error;
      }
    },
    [cache.featuredProducts]
  );

  const fetchHotDeals = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.hotDeals.data &&
        isCacheValid(cache.hotDeals.timestamp)
      ) {
        return cache.hotDeals.data;
      }

      try {
        const response = await productAPI.getHotDeals();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            hotDeals: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching hot deals:", error);
        throw error;
      }
    },
    [cache.hotDeals]
  );

  const fetchSpecialDeals = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.specialDeals.data &&
        isCacheValid(cache.specialDeals.timestamp)
      ) {
        return cache.specialDeals.data;
      }

      try {
        const response = await productAPI.getSpecialDeals();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            specialDeals: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching special deals:", error);
        throw error;
      }
    },
    [cache.specialDeals]
  );

  const fetchCategories = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.categories.data &&
        isCacheValid(cache.categories.timestamp)
      ) {
        return cache.categories.data;
      }

      try {
        const response = await productAPI.getCategories();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            categories: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
    [cache.categories]
  );

  const fetchSubCategories = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.subCategories.data &&
        isCacheValid(cache.subCategories.timestamp)
      ) {
        return cache.subCategories.data;
      }

      try {
        const response = await productAPI.getSubCategories();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            subCategories: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
      }
    },
    [cache.subCategories]
  );

  const fetchBrands = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.brands.data &&
        isCacheValid(cache.brands.timestamp)
      ) {
        return cache.brands.data;
      }

      try {
        const response = await productAPI.getBrands();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            brands: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
      }
    },
    [cache.brands]
  );

  const fetchProducts = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.products.data &&
        isCacheValid(cache.products.timestamp)
      ) {
        return cache.products.data;
      }

      try {
        const response = await productAPI.getProducts();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            products: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    [cache.products]
  );
  const fetch2Products = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.products.data &&
        isCacheValid(cache.products.timestamp)
      ) {
        return cache.products.data;
      }

      try {
        const response = await productAPI.get2Products();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            products: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    [cache.products]
  );

  const fetchSliders = useCallback(
    async (forceRefresh = false) => {
      if (
        !forceRefresh &&
        cache.sliders.data &&
        isCacheValid(cache.sliders.timestamp)
      ) {
        return cache.sliders.data;
      }

      try {
        const response = await sliderAPI.getSliders();
        if (response.data.status === 200) {
          const data = response.data.data;
          setCache((prev) => ({
            ...prev,
            sliders: { data, timestamp: Date.now() },
          }));
          return data;
        }
      } catch (error) {
        console.error("Error fetching sliders:", error);
        throw error;
      }
    },
    [cache.sliders]
  );

  const clearCache = () => {
    setCache({
      featuredProducts: { data: null, timestamp: null },
      hotDeals: { data: null, timestamp: null },
      specialDeals: { data: null, timestamp: null },
      categories: { data: null, timestamp: null },
      brands: { data: null, timestamp: null },
      products: { data: null, timestamp: null },
      subCategories: { data: null, timestamp: null },
      sliders: { data: null, timestamp: null },
    });
  };

  const value = {
    fetchFeaturedProducts,
    fetchHotDeals,
    fetchSpecialDeals,
    fetchCategories,
    fetchSubCategories,
    fetchBrands,
    fetchProducts,
    fetch2Products,
    fetchSliders,
    clearCache,
    cache,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};
