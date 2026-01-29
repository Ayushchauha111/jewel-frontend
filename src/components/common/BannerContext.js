import React, { createContext, useState } from "react";

export const BannerContext = createContext();

export const BannerProvider = ({ children }) => {
  const [bannerBackground, setBannerBackground] = useState("#f8f9fa");

  return (
    <BannerContext.Provider value={{ bannerBackground, setBannerBackground }}>
      {children}
    </BannerContext.Provider>
  );
};