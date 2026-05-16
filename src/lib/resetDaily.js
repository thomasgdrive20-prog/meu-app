/**
 * Verifica se os dados diários precisam ser resetados.
 * Chamado no boot do app. Compara a data salva no localStorage
 * com a data atual — se mudou, limpa água, refeições e suplementos diários.
 */
export function checkDailyReset(store) {
  const today = new Date().toISOString().slice(0, 10)
  const state = store.getState()

  // Água
  if (state.waterDate && state.waterDate !== today) {
    store.setState({ water: 0, waterDate: today })
  }

  // Refeições
  if (state.mealDate && state.mealDate !== today) {
    store.setState({ mealDone: [], mealDate: today })
  }

  // Suplementos diários — mantém os semanais que ainda são válidos
  if (state.suplDate && state.suplDate !== today) {
    store.setState({ suplDone: [], suplDate: today })
  }
}
