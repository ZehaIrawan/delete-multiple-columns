import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const placesApi = createApi({
  reducerPath: "placesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://places.googleapis.com/v1/" }),
  endpoints: (builder) => ({
    searchPlaces: builder.query({
      query: ({ textQuery, locationBias }) => ({
        url: "places:searchText",
        method: "POST",
        body: {
          textQuery,
          locationBias,
        },
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": import.meta.env.VITE_GMAP_API_KEY,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.businessStatus,places.rating,places.id",
        },
      }),
      transformResponse: (response: any) => {
        // console.log(response, "res");
        return response.places;
      },
    }),
  }),
});

export const { useSearchPlacesQuery, useLazySearchPlacesQuery } = placesApi;
