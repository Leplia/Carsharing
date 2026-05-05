package org.sharing.carsharing.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.sharing.carsharing.dto.carDto.CarDto;
import org.sharing.carsharing.dto.carDto.CarManufactureDto;
import org.sharing.carsharing.dto.carDto.CarModelDto;
import org.sharing.carsharing.dto.carDto.CarModelOptionDto;
import org.sharing.carsharing.dto.carDto.request.CarAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarManufactureAddRequest;
import org.sharing.carsharing.dto.carDto.request.CarModelAddRequest;
import org.sharing.carsharing.mapper.car.CarMapper;
import org.sharing.carsharing.mapper.car.CarManufactureMapper;
import org.sharing.carsharing.mapper.car.CarModelMapper;
import org.sharing.carsharing.model.Car;
import org.sharing.carsharing.model.CarManufacture;
import org.sharing.carsharing.model.CarModel;
import org.sharing.carsharing.model.enums.BodyType;
import org.sharing.carsharing.model.enums.CarStatus;
import org.sharing.carsharing.model.enums.Transmission;
import org.sharing.carsharing.repository.CarManufactureRepository;
import org.sharing.carsharing.repository.CarModelRepository;
import org.sharing.carsharing.repository.CarsRepository;
import org.sharing.carsharing.service.impl.CarsServiceImpl;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarsServiceTest{

    @Mock
    private CarsRepository carsRepository;

    @Mock
    private CarModelRepository carModelRepository;

    @Mock
    private CarManufactureRepository carManufactureRepository;

    @Mock
    private CarMapper carMapper;

    @Mock
    private CarModelMapper carModelMapper;

    @Mock
    private CarManufactureMapper carManufactureMapper;

    @InjectMocks
    private CarsServiceImpl carsService;

    private Car testCar;
    private CarModel testCarModel;
    private CarManufacture testCarManufacture;
    private CarDto testCarDto;
    private CarAddRequest carAddRequest;
    private CarModelAddRequest carModelAddRequest;
    private CarManufactureAddRequest carManufactureAddRequest;

    @BeforeEach
    void setUp() {
        testCarManufacture = new CarManufacture();
        testCarManufacture.setModelId(1L);
        testCarManufacture.setName("Tesla");
        testCarManufacture.setCountry("USA");
        testCarManufacture.setBadgeUrl("https://example.com/tesla.png");

        testCarModel = new CarModel();
        testCarModel.setModelId(1L);
        testCarModel.setName("Model X");
        testCarModel.setTransmission(Transmission.AUTOMATIC);
        testCarModel.setSeats(5);
        testCarModel.setBodyType(BodyType.SUV);
        testCarModel.setCoefficient(1.2f);
        testCarModel.setCarManufacture(testCarManufacture);

        testCar = new Car();
        testCar.setCarId(1L);
        testCar.setVinNumber("VIN123456789");
        testCar.setColor("Red");
        testCar.setYear(2023);
        testCar.setCarStatus(CarStatus.AVAILABLE);
        testCar.setFuelLevel(100);
        testCar.setLocationX(53.9045);
        testCar.setLocationY(27.5615);
        testCar.setDescription("Test car");
        testCar.setPhotoUrl("https://example.com/car.jpg");
        testCar.setCarModel(testCarModel);

        testCarDto = new CarDto();
        testCarDto.setCarId(1L);
        testCarDto.setColor("Red");
        testCarDto.setYear(2023);
        testCarDto.setCarStatus(CarStatus.AVAILABLE);
        testCarDto.setFuelLevel(100);
        testCarDto.setLocationX(53.9045);
        testCarDto.setLocationY(27.5615);
        testCarDto.setDescription("Test car");
        testCarDto.setPhotoUrl("https://example.com/car.jpg");

        carAddRequest = new CarAddRequest();
        carAddRequest.setVinNumber("VIN123456789");
        carAddRequest.setColor("Red");
        carAddRequest.setYear(2023);
        carAddRequest.setLocationX(53.9045);
        carAddRequest.setLocationY(27.5615);
        carAddRequest.setDescription("Test car");
        carAddRequest.setPhotoUrl("https://example.com/car.jpg");
        carAddRequest.setCarModelId(1L);

        carModelAddRequest = new CarModelAddRequest();
        carModelAddRequest.setName("Model X");
        carModelAddRequest.setTransmission(org.sharing.carsharing.model.enums.Transmission.AUTOMATIC);
        carModelAddRequest.setSeats(5);
        carModelAddRequest.setBodyType(org.sharing.carsharing.model.enums.BodyType.SUV);
        carModelAddRequest.setCoefficient(1.2f);
        carModelAddRequest.setCarManufactureId(1L);

        carManufactureAddRequest = new CarManufactureAddRequest();
        carManufactureAddRequest.setName("Tesla");
        carManufactureAddRequest.setCountry("USA");
        carManufactureAddRequest.setBadgeUrl("https://example.com/tesla.png");
    }

    @Test
    void getAvailableCars_Success() {
        // Arrange
        List<Car> cars = List.of(testCar);
        when(carsRepository.findAllByCarStatus(CarStatus.AVAILABLE)).thenReturn(cars);
        when(carMapper.toDto(testCar)).thenReturn(testCarDto);

        // Act
        List<CarDto> result = carsService.getAvailableCars();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getCarId());
        assertEquals(CarStatus.AVAILABLE, result.get(0).getCarStatus());
        
        verify(carsRepository, times(1)).findAllByCarStatus(CarStatus.AVAILABLE);
        verify(carMapper, times(1)).toDto(testCar);
    }

    @Test
    void getAllCars_Success() {
        // Arrange
        List<Car> cars = List.of(testCar);
        when(carsRepository.findAll()).thenReturn(cars);
        when(carMapper.toDto(testCar)).thenReturn(testCarDto);

        // Act
        List<CarDto> result = carsService.getAllCars();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getCarId());
        
        verify(carsRepository, times(1)).findAll();
        verify(carMapper, times(1)).toDto(testCar);
    }

    @Test
    void addCar_Success() {
        // Arrange
        when(carModelRepository.findById(1L)).thenReturn(Optional.of(testCarModel));
        when(carsRepository.save(any(Car.class))).thenReturn(testCar);
        when(carMapper.toDto(testCar)).thenReturn(testCarDto);

        // Act
        CarDto result = carsService.addCar(carAddRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCarId());
        assertEquals(CarStatus.AVAILABLE, result.getCarStatus());
        assertEquals(100, result.getFuelLevel());
        
        verify(carModelRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(any(Car.class));
        verify(carMapper, times(1)).toDto(testCar);
    }

    @Test
    void addCar_CarModelNotFound_ThrowsException() {
        // Arrange
        when(carModelRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.addCar(carAddRequest));
        assertEquals("CarModel not found with id: 1", exception.getMessage());
        
        verify(carModelRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void deleteCar_Success() {
        // Arrange
        doNothing().when(carsRepository).deleteById(1L);

        // Act
        carsService.deleteCar(1L);

        // Assert
        verify(carsRepository, times(1)).deleteById(1L);
    }

    @Test
    void updateCarStatus_Success() {
        // Arrange
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));
        when(carsRepository.save(testCar)).thenReturn(testCar);
        
        CarDto updatedDto = new CarDto();
        updatedDto.setCarId(1L);
        updatedDto.setCarStatus(CarStatus.BOOKED);
        when(carMapper.toDto(testCar)).thenReturn(updatedDto);

        // Act
        CarDto result = carsService.updateCarStatus(1L, CarStatus.BOOKED);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCarId());
        assertEquals(CarStatus.BOOKED, result.getCarStatus());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(testCar);
        verify(carMapper, times(1)).toDto(testCar);
        
        // Verify car status was updated
        assertEquals(CarStatus.BOOKED, testCar.getCarStatus());
    }

    @Test
    void updateCarStatus_CarNotFound_ThrowsException() {
        // Arrange
        when(carsRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.updateCarStatus(1L, CarStatus.BOOKED));
        assertEquals("Car not found: 1", exception.getMessage());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void getCarModels_Success() {
        // Arrange
        List<CarModel> models = List.of(testCarModel);
        when(carModelRepository.findAll()).thenReturn(models);

        // Act
        List<CarModelOptionDto> result = carsService.getCarModels();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        
        verify(carModelRepository, times(1)).findAll();
    }

    @Test
    void addCarModel_Success() {
        // Arrange
        when(carManufactureRepository.findById(1L)).thenReturn(Optional.of(testCarManufacture));
        when(carModelRepository.save(any(CarModel.class))).thenReturn(testCarModel);
        
        CarModelDto carModelDto = new CarModelDto();
        carModelDto.setName("Model X");
        when(carModelMapper.toDto(testCarModel)).thenReturn(carModelDto);

        // Act
        CarModelDto result = carsService.addCarModel(carModelAddRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Model X", result.getName());
        
        verify(carManufactureRepository, times(1)).findById(1L);
        verify(carModelRepository, times(1)).save(any(CarModel.class));
        verify(carModelMapper, times(1)).toDto(testCarModel);
    }

    @Test
    void addCarModel_CarManufactureNotFound_ThrowsException() {
        // Arrange
        when(carManufactureRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.addCarModel(carModelAddRequest));
        assertEquals("CarManufacture not found with id: 1", exception.getMessage());
        
        verify(carManufactureRepository, times(1)).findById(1L);
        verify(carModelRepository, never()).save(any(CarModel.class));
    }

    @Test
    void addCarManufacture_Success() {
        // Arrange
        when(carManufactureRepository.save(any(CarManufacture.class))).thenReturn(testCarManufacture);
        
        CarManufactureDto carManufactureDto = new CarManufactureDto();
        carManufactureDto.setModelId(1L);
        carManufactureDto.setName("Tesla");
        when(carManufactureMapper.toDto(testCarManufacture)).thenReturn(carManufactureDto);

        // Act
        CarManufactureDto result = carsService.addCarManufacture(carManufactureAddRequest);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getModelId());
        assertEquals("Tesla", result.getName());
        
        verify(carManufactureRepository, times(1)).save(any(CarManufacture.class));
        verify(carManufactureMapper, times(1)).toDto(testCarManufacture);
    }

    @Test
    void getAllCarManufactures_Success() {
        // Arrange
        List<CarManufacture> manufactures = List.of(testCarManufacture);
        when(carManufactureRepository.findAll()).thenReturn(manufactures);
        
        CarManufactureDto carManufactureDto = new CarManufactureDto();
        carManufactureDto.setModelId(1L);
        carManufactureDto.setName("Tesla");
        when(carManufactureMapper.toDto(testCarManufacture)).thenReturn(carManufactureDto);

        // Act
        List<CarManufactureDto> result = carsService.getAllCarManufactures();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getModelId());
        assertEquals("Tesla", result.get(0).getName());
        
        verify(carManufactureRepository, times(1)).findAll();
        verify(carManufactureMapper, times(1)).toDto(testCarManufacture);
    }

    @Test
    void refuelCar_Success() {
        // Arrange
        testCar.setFuelLevel(30);
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));
        when(carsRepository.save(testCar)).thenReturn(testCar);
        
        CarDto carDto = new CarDto();
        carDto.setCarId(1L);
        carDto.setFuelLevel(100);
        when(carMapper.toDto(testCar)).thenReturn(carDto);

        // Act
        CarDto result = carsService.refuelCar(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCarId());
        assertEquals(100, result.getFuelLevel());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(testCar);
        verify(carMapper, times(1)).toDto(testCar);
        
        // Verify fuel level was updated to 100
        assertEquals(100, testCar.getFuelLevel());
    }

    @Test
    void refuelCar_CarNotFound_ThrowsException() {
        // Arrange
        when(carsRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.refuelCar(1L));
        assertEquals("Автомобиль с ID 1 не найден", exception.getMessage());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void bookCar_Success() {
        // Arrange
        testCar.setCarStatus(CarStatus.AVAILABLE);
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));
        when(carsRepository.save(testCar)).thenReturn(testCar);
        
        CarDto carDto = new CarDto();
        carDto.setCarId(1L);
        carDto.setCarStatus(CarStatus.BOOKED);
        when(carMapper.toDto(testCar)).thenReturn(carDto);

        // Act
        CarDto result = carsService.bookCar(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCarId());
        assertEquals(CarStatus.BOOKED, result.getCarStatus());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(testCar);
        verify(carMapper, times(1)).toDto(testCar);
        
        // Verify car status was updated to BOOKED
        assertEquals(CarStatus.BOOKED, testCar.getCarStatus());
    }

    @Test
    void bookCar_CarNotFound_ThrowsException() {
        // Arrange
        when(carsRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.bookCar(1L));
        assertEquals("Car not found: 1", exception.getMessage());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void bookCar_CarNotAvailable_ThrowsException() {
        // Arrange
        testCar.setCarStatus(CarStatus.IN_USE);
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.bookCar(1L));
        assertEquals("Car is not available for booking. Current status: IN_USE", exception.getMessage());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void startRide_Success() {
        // Arrange
        testCar.setCarStatus(CarStatus.BOOKED);
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));
        when(carsRepository.save(testCar)).thenReturn(testCar);
        
        CarDto carDto = new CarDto();
        carDto.setCarId(1L);
        carDto.setCarStatus(CarStatus.IN_USE);
        when(carMapper.toDto(testCar)).thenReturn(carDto);

        // Act
        CarDto result = carsService.startRide(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCarId());
        assertEquals(CarStatus.IN_USE, result.getCarStatus());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(testCar);
        verify(carMapper, times(1)).toDto(testCar);
        
        // Verify car status was updated to IN_USE
        assertEquals(CarStatus.IN_USE, testCar.getCarStatus());
    }

    @Test
    void startRide_CarNotBooked_ThrowsException() {
        // Arrange
        testCar.setCarStatus(CarStatus.AVAILABLE);
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.startRide(1L));
        assertEquals("Car is not booked. Current status: AVAILABLE", exception.getMessage());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }

    @Test
    void endRide_Success() {
        // Arrange
        testCar.setCarStatus(CarStatus.IN_USE);
        when(carsRepository.findById(1L)).thenReturn(Optional.of(testCar));
        when(carsRepository.save(testCar)).thenReturn(testCar);
        
        CarDto carDto = new CarDto();
        carDto.setCarId(1L);
        carDto.setCarStatus(CarStatus.AVAILABLE);
        when(carMapper.toDto(testCar)).thenReturn(carDto);

        // Act
        CarDto result = carsService.endRide(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getCarId());
        assertEquals(CarStatus.AVAILABLE, result.getCarStatus());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, times(1)).save(testCar);
        verify(carMapper, times(1)).toDto(testCar);
        
        // Verify car status was updated to AVAILABLE
        assertEquals(CarStatus.AVAILABLE, testCar.getCarStatus());
    }

    @Test
    void endRide_CarNotFound_ThrowsException() {
        // Arrange
        when(carsRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> carsService.endRide(1L));
        assertEquals("Car not found: 1", exception.getMessage());
        
        verify(carsRepository, times(1)).findById(1L);
        verify(carsRepository, never()).save(any(Car.class));
    }
}