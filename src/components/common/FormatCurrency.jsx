const FormatCurrency = ({amount}) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount)
}
export default FormatCurrency;