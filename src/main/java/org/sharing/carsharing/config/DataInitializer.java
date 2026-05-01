package org.sharing.carsharing.config;

import lombok.RequiredArgsConstructor;
import org.sharing.carsharing.model.CarManufacture;
import org.sharing.carsharing.model.CarModel;
import org.sharing.carsharing.model.User;
import org.sharing.carsharing.model.enums.BodyType;
import org.sharing.carsharing.model.enums.Role;
import org.sharing.carsharing.model.enums.ServiceType;
import org.sharing.carsharing.model.enums.Transmission;
import org.sharing.carsharing.repository.CarManufactureRepository;
import org.sharing.carsharing.repository.CarModelRepository;
import org.sharing.carsharing.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CarManufactureRepository carManufactureRepository;
    private final CarModelRepository carModelRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        // Drop the old role check constraint and recreate it with SISADMIN included
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            jdbcTemplate.execute(
                "ALTER TABLE users ADD CONSTRAINT users_role_check " +
                "CHECK (role IN ('USER', 'ADMIN', 'SISADMIN'))"
            );
        } catch (Exception e) {
            System.out.println("[DataInitializer] Could not update role constraint: " + e.getMessage());
        }

        if (!userRepository.existsByLogin("admin")) {
            User admin = new User();
            admin.setLogin("admin");
            admin.setEmail("admin@carsharing.local");
            admin.setPhone("+70000000000");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(Role.SISADMIN);
            admin.setBlocked(false);
            admin.setRating(5.0F);
            admin.setCredentials(null);
            admin.setServiceType(ServiceType.LOCAL);
            admin.setServiceId(null);
            userRepository.save(admin);
            System.out.println("[DataInitializer] System admin created: login=admin, password=admin");
        }

        // Create test car manufactures if none exist
        if (carManufactureRepository.count() == 0) {
            CarManufacture toyota = new CarManufacture();
            toyota.setName("Toyota");
            toyota.setCountry("Japan");
            carManufactureRepository.save(toyota);

            CarManufacture bmw = new CarManufacture();
            bmw.setName("BMW");
            bmw.setCountry("Germany");
            carManufactureRepository.save(bmw);

            CarManufacture tesla = new CarManufacture();
            tesla.setName("Tesla");
            tesla.setCountry("USA");
            carManufactureRepository.save(tesla);

            System.out.println("[DataInitializer] Created 3 car manufactures");
        }

        // Create test car models if none exist
        if (carModelRepository.count() == 0) {
            List<CarManufacture> manufactures = carManufactureRepository.findAll();
            
            if (!manufactures.isEmpty()) {
                CarManufacture toyota = manufactures.stream()
                    .filter(m -> m.getName().equals("Toyota"))
                    .findFirst()
                    .orElse(manufactures.get(0));
                
                CarManufacture bmw = manufactures.stream()
                    .filter(m -> m.getName().equals("BMW"))
                    .findFirst()
                    .orElse(manufactures.get(0));
                
                CarManufacture tesla = manufactures.stream()
                    .filter(m -> m.getName().equals("Tesla"))
                    .findFirst()
                    .orElse(manufactures.get(0));

                // Toyota models
                CarModel camry = new CarModel();
                camry.setName("Camry");
                camry.setTransmission(Transmission.AUTOMATIC);
                camry.setSeats(5);
                camry.setBodyType(BodyType.SEDAN);
                camry.setCoefficient(1.2F);
                camry.setCarManufacture(toyota);
                carModelRepository.save(camry);

                CarModel rav4 = new CarModel();
                rav4.setName("RAV4");
                rav4.setTransmission(Transmission.AUTOMATIC);
                rav4.setSeats(5);
                rav4.setBodyType(BodyType.SUV);
                rav4.setCoefficient(1.5F);
                rav4.setCarManufacture(toyota);
                carModelRepository.save(rav4);

                // BMW models
                CarModel x5 = new CarModel();
                x5.setName("X5");
                x5.setTransmission(Transmission.AUTOMATIC);
                x5.setSeats(5);
                x5.setBodyType(BodyType.SUV);
                x5.setCoefficient(2.0F);
                x5.setCarManufacture(bmw);
                carModelRepository.save(x5);

                CarModel m3 = new CarModel();
                m3.setName("M3");
                m3.setTransmission(Transmission.MANUAL);
                m3.setSeats(4);
                m3.setBodyType(BodyType.SEDAN);
                m3.setCoefficient(2.5F);
                m3.setCarManufacture(bmw);
                carModelRepository.save(m3);

                // Tesla models
                CarModel model3 = new CarModel();
                model3.setName("Model 3");
                model3.setTransmission(Transmission.AUTOMATIC);
                model3.setSeats(5);
                model3.setBodyType(BodyType.SEDAN);
                model3.setCoefficient(1.8F);
                model3.setCarManufacture(tesla);
                carModelRepository.save(model3);

                CarModel modelY = new CarModel();
                modelY.setName("Model Y");
                modelY.setTransmission(Transmission.AUTOMATIC);
                modelY.setSeats(7);
                modelY.setBodyType(BodyType.SUV);
                modelY.setCoefficient(2.0F);
                modelY.setCarManufacture(tesla);
                carModelRepository.save(modelY);

                System.out.println("[DataInitializer] Created 6 car models");
            }
        }
    }
}
