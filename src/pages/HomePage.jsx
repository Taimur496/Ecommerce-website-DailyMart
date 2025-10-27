import React from "react";
import HomeTop from "../components/home/HomeTop";
import FeaturedProducts from "../components/home/FeaturedProducts";
import NewArrival from "../components/home/NewArrival";
import Collection from "../components/home/Collection";
import Categories from "../components/home/Categories";

import UpperMenu from "../components/home/UpperMenu";

const HomePage = () => {
  return (
    <div>
      <UpperMenu />
      <HomeTop />
      <FeaturedProducts />
      <NewArrival />
      <Collection />
      <Categories />
    </div>
  );
};

export default HomePage;
