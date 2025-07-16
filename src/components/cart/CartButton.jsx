import { Nav } from "react-bootstrap"
import { ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react";

import { useCart } from "../../contexts/CartContext";


export default function CartButton() {
    const { cartItems } = useCart();

    return (
        <Nav.Link href="/cart" className="me-3 position-relative">
            <ShoppingCart size={24} className="text-dark" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartItems}<span className="visually-hidden">items in cart</span>
            </span>
        </Nav.Link>
    )
}