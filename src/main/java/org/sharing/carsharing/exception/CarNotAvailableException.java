package org.sharing.carsharing.exception;

public class CarNotAvailableException extends RuntimeException {
    public CarNotAvailableException(String message) {
        super(message);
    }
    
    public CarNotAvailableException(Long carId) {
        super("Car with id " + carId + " is not available");
    }
}