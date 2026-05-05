package org.sharing.carsharing.exception;

public class OrderAlreadyCompletedException extends RuntimeException {
    public OrderAlreadyCompletedException(String message) {
        super(message);
    }
    
    public OrderAlreadyCompletedException(Long orderId) {
        super("Order with id " + orderId + " is already completed");
    }
}