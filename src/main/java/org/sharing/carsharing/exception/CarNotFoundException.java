package org.sharing.carsharing.exception;

public class CarNotFoundException extends RuntimeException {
    public CarNotFoundException(String message) {
        super(message);
    }
    
    public CarNotFoundException(Long carId) {
        super("Car not found with id: " + carId);
    }
}