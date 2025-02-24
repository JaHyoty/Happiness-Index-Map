import axios from "axios";

export const fetchNewsByZipCode = async (zipCode) => {
  try {
    const response = await axios.get(`/api/news/${zipCode}`);
    const articles = response.data;

    if (!articles || articles.length === 0) {
      throw new Error("No articles found for this ZIP code.");
    }

    console.log("Raw data received:", articles);

    // Clean up URLs if needed
    const cleanedData = articles.map((article) => ({
      ...article,
      url: article.url.split('"\r\n"')[0], // Remove trailing characters
    }));

    console.log("Cleaned data:", cleanedData);

    return cleanedData.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
    }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || "Failed to fetch news for this ZIP Code.";
    console.error("News Fetch Error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const fetchNewsByCity = async (city) => {
  try {
    const response = await axios.get(`/api/news/city/${city}`);
    const articles = response.data;

    if (!articles || articles.length === 0) {
      throw new Error("No articles found for this city.");
    }

    console.log("Raw data received:", articles);

    // Clean up URLs if needed
    const cleanedData = articles.map((article) => ({
      ...article,
      url: article.url.split('"\r\n"')[0], // Remove trailing characters
    }));

    console.log("Cleaned data:", cleanedData);

    return cleanedData.map((article) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      zipCode: article.zipCode, // Include ZIP Code if you want it in the frontend
    }));
  } catch (error) {
    const errorMessage =
      error.response?.data?.error || "Failed to fetch news for this city.";
    console.error("City News Fetch Error:", errorMessage);
    throw new Error(errorMessage);
  }
};
