export const initialVoucherState = {
  selected: [],
  appliedCodes: [],
  discount: 0,
  freeShipping: false,
  error: "",
};

export function voucherReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_VOUCHER": {
      const exists = state.selected.find(v => v.id === action.voucher.id);
      let next = [];

      if (exists) {
        next = state.selected.filter(v => v.id !== action.voucher.id);
      } else {
        const hasDiscount = state.selected.some(
          v => v.type === "PERCENT" || v.type === "AMOUNT"
        );
        const hasShip = state.selected.some(v => v.type === "SHIPPING_FREE");

        if (
          (action.voucher.type === "SHIPPING_FREE" && hasShip) ||
          ((action.voucher.type === "PERCENT" || action.voucher.type === "AMOUNT") && hasDiscount)
        ) {
          return state;
        }

        next = [...state.selected, action.voucher].slice(0, 2);
      }

      return { ...state, selected: next };
    }

    case "APPLY_SUCCESS":
      return {
        ...state,
        appliedCodes: action.codes,
        discount: action.discount,
        freeShipping: action.freeShipping,
        error: "",
      };

    case "ERROR":
      return { ...state, error: action.message };

    case "RESET":
      return initialVoucherState;

    default:
      return state;
  }
}
