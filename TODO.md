* [ ] Rework Favorites.
  * [ ] Change focus logic when enter is pressed in the option panel. New order Station -> Number of departures -> Fetch interval -> Text size -> Close.
  * [ ] Move favorites button out from option panel and in front of station name in main canvas. Keep tooltip. Change size to same text size as station name. Change button text to emoji heart. Logic, if station is not in favorites already. Heart is red. Press button. Favorite is saved. If current station is in the favorite list, change heart to white heart (lightmode) or black heart (darkmode) and disable button.
  * [ ] Allign the Close button in the option panel to the right (where the favorite button was previously).
  * [ ] Increase max number of favorites to 10.
* [ ] Transport mode all checked/unchecked.
  * [ ] At the right side of the Transport mode (filters) text, add a checkbox. Clicking the button should check or uncheck all transport modes. If all transport modes are checked it sould be checked, if all unchecked - it should be unchecked. If some transport modes are checked it should have a middle state. Neiter checked nor unchecked.
* [ ] Add new transport mode. "flybuss" is the api, Airport express bus (norwegian: Flybuss). Emoji for this tranport mode 🚏. New order of transport modes in table below:
  ```
  | (emoji) [ ] Metro | (emoji) [ ] Bus             |
  | (emoji) [ ] Rail  | ((emoji) [ ] Coach          |
  | (emoji) [ ] Train | (emoji) Airport Express Bus |
  | (emoji) [ ] Water |                             |
  ```
