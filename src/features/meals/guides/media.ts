/**
 * Real photos and how-to videos for each recipe, keyed by recipe id.
 * Photos are Wikimedia Commons files, loaded on the phone. Each has a credit page with the photographer and licence. Never AI images.
 * Videos are YouTube ids, played inside the recipe screen.
 */
export type RecipeMedia = { photo: string | null; videoId: string | null; videoTitle: string | null };

export const MEDIA: Record<string, RecipeMedia> = {
  rcp_abacha: { photo: 'A_plate_of_abacha_(african_salad)_ready_for_consumption.jpg', videoId: 'xEXmEbszjFI', videoTitle: 'Nigerian African salad (abacha ncha na ugba)' },
  rcp_akara_pap: { photo: 'Akara_na_Akamu_(Fried_Bean_cakes_and_Pap).jpg', videoId: 'cqAMOlnqPVo', videoTitle: 'How to make Nigerian akara: soft and fluffy akara' },
  rcp_banga_starch: { photo: 'Eba_served_with_Fresh_fish_banga_soup_in_a_clay_pot.jpg', videoId: 'bfvkh5T8RQ0', videoTitle: 'How to cook banga soup and starch' },
  rcp_beans_dodo: { photo: 'Beans_and_plantain.jpg', videoId: 'RrdAbI3mea4', videoTitle: 'How to make Nigerian stewed beans (ewa riro)' },
  rcp_bread_egg: { photo: null, videoId: 'TOjRrl_oSmE', videoTitle: 'How to make egg sauce (Nigerian egg sauce recipe)' },
  rcp_catfish_pepper_soup: { photo: 'Cat_Fish_pepper_soup.png', videoId: 'BQY4aE_pacs', videoTitle: 'Crowd-pleasing Nigerian catfish pepper soup' },
  rcp_chicken_shawarma: { photo: 'Shawarma.jpg', videoId: 'GOB88rBUjD0', videoTitle: 'How to make Nigerian chicken shawarma' },
  rcp_chicken_stir_fry: { photo: 'Chicken_stir_fry_(1126047571).jpg', videoId: 'lXpCuCVGwLY', videoTitle: 'Chicken stir fry recipe (better than takeout)' },
  rcp_dodo_egg: { photo: 'Dodo_1.JPG', videoId: 'FRqLlUceQ30', videoTitle: 'Nigerian fried plantain with eggs (dodo ati eyin dindin)' },
  rcp_efo_riro: { photo: 'Efo_riro.jpg', videoId: 'KQaNxRRQV-Y', videoTitle: 'How to make Nigerian efo riro' },
  rcp_egusi_eba: { photo: 'Egusi_soup_and_Eba.jpg', videoId: 'WlnAEuuP0Ls', videoTitle: 'How to make egusi soup (Sisi Jemimah)' },
  rcp_gizdodo: { photo: null, videoId: '-I5R_hgMeuw', videoTitle: 'Gizdodo recipe (Sisi Jemimah)' },
  rcp_indomie_egg: { photo: 'Noodles_and_fried_egg_2.jpg', videoId: 'eXGUpflBf-E', videoTitle: 'Easy Indomie noodles, veggies stir fry and fried eggs' },
  rcp_jollof: { photo: 'Jollof_rice_with_dodo.jpg', videoId: 'hdSPFMEmPl8', videoTitle: 'How to cook party jollof rice' },
  rcp_moi_moi: { photo: 'Moin_Moin.jpg', videoId: 'YZ6V1CeP3TU', videoTitle: 'How to make moi moi: fail-proof recipe' },
  rcp_nigerian_fried_rice: { photo: 'Fried_Rice,_Jollof_rice_and_salad,_served_with_Grilled_Chicken.jpg', videoId: 'DuqY74Oy9RM', videoTitle: 'The best Nigerian fried rice: party fried rice (Chinwe Uzoma Kitchen)' },
  rcp_oats_banana: { photo: 'Oat_porridge_in_Ghana.jpg', videoId: 'LgZeATxZPDk', videoTitle: 'Banana oatmeal recipe' },
  rcp_ofada_ayamase: { photo: 'Ofada_Rice.jpg', videoId: 'acpAikUzx5Q', videoTitle: 'How to make ayamase stew (ofada / designer stew)' },
  rcp_okra_soup: { photo: 'Okro_soup_with_beef_and_Seafoods.jpg', videoId: 'F15RWg5QIWM', videoTitle: 'How to cook a perfect Nigerian okro soup' },
  rcp_plantain_porridge: { photo: null, videoId: '13DaFvSByl8', videoTitle: 'How to make Nigerian plantain porridge' },
  rcp_rice_stew: { photo: 'White_rice_and_stew_(Banga_stew)_(Nigerian_dish).jpg', videoId: 'rOwsAhJ8HpI', videoTitle: 'The best Nigerian chicken stew' },
  rcp_shakshuka: { photo: 'Shakshuka_by_Calliopejen1.jpg', videoId: 'sVHxvhY6AkE', videoTitle: 'Easy shakshuka recipe (eggs in tomato sauce)' },
  rcp_spag_bolognese: { photo: 'Spaghetti_bolognese_at_restaurant_Persilja.jpg', videoId: '3u7KN3TfTyE', videoTitle: 'How to make the best bolognese of your life' },
  rcp_spaghetti_jollof: { photo: 'Jollof_Spaghettis_with_turkey_wings.png', videoId: 'lwz7fHOTT6M', videoTitle: 'How to make jollof spaghetti for beginners' },
  rcp_suya: { photo: 'Suya_seller_in_Nigeria.jpg', videoId: 'pvveb1c9VRs', videoTitle: 'How to make Nigerian beef suya' },
  rcp_yam_egg: { photo: 'Boiled_yam_and_egg_sauce.jpg', videoId: 'WNqi4tgAXlU', videoTitle: 'Easy yam and egg sauce recipe' },
  rcp_yam_porridge: { photo: 'Brown_beans_and_yam_porridge.jpg', videoId: 'X3g-HEL6XTo', videoTitle: 'How to make Nigerian yam porridge (asaro)' },
};
