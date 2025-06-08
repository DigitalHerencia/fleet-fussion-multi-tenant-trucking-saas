// Test file for assignment functionality
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAssignment() {
  try {
    console.log('🔍 Testing Driver Assignment Functionality...');

    // 1. Get the test organization
    const org = await prisma.organization.findUnique({
      where: { clerkId: 'org_2xvBliaRVTLXpaA6Uc5n66Jsw0u' },
    });

    if (!org) {
      console.log('❌ Test organization not found');
      return;
    }

    console.log('✅ Organization found:', org.name);

    // 2. Get drivers
    const drivers = await prisma.driver.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        currentAssignment: true,
      },
    });

    console.log(`✅ Found ${drivers.length} drivers:`);
    drivers.forEach(driver => {
      console.log(
        `  - ${driver.firstName} ${driver.lastName} (${driver.user.email})`
      );
      console.log(`    User ID: ${driver.user.id}`);
      console.log(`    Driver ID: ${driver.id}`);
      console.log(
        `    Current Assignment: ${driver.currentAssignment ? 'Yes' : 'No'}`
      );
      if (driver.currentAssignment) {
        console.log(`      Assignment ID: ${driver.currentAssignment.id}`);
        console.log(`      Type: ${driver.currentAssignment.assignmentType}`);
        console.log(
          `      Load ID: ${driver.currentAssignment.loadId || 'N/A'}`
        );
        console.log(
          `      Vehicle ID: ${driver.currentAssignment.vehicleId || 'N/A'}`
        );
      }
    });

    // 3. Get loads
    const loads = await prisma.load.findMany({
      where: { organizationId: org.id },
      include: {
        driver: true,
        vehicle: true,
        trailer: true,
      },
    });

    console.log(`\n✅ Found ${loads.length} loads:`);
    loads.forEach(load => {
      console.log(`  - ${load.loadNumber} (${load.status})`);
      console.log(
        `    Driver: ${load.driver ? `${load.driver.firstName} ${load.driver.lastName}` : 'Not assigned'}`
      );
      console.log(
        `    Vehicle: ${load.vehicle ? load.vehicle.unitNumber : 'Not assigned'}`
      );
      console.log(
        `    Trailer: ${load.trailer ? load.trailer.unitNumber : 'Not assigned'}`
      );
    });

    // 4. Get vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { organizationId: org.id },
    });

    console.log(`\n✅ Found ${vehicles.length} vehicles:`);
    vehicles.forEach(vehicle => {
      console.log(
        `  - ${vehicle.unitNumber} (${vehicle.type}) - ${vehicle.status}`
      );
    });

    console.log('\n🎯 Test Data Summary:');
    console.log(`Organization: ${org.name}`);
    console.log(`Drivers: ${drivers.length}`);
    console.log(`Loads: ${loads.length}`);
    console.log(`Vehicles: ${vehicles.length}`);

    // Test driver assignment action
    if (drivers.length > 0) {
      const testDriver = drivers[0];
      console.log(
        `\n🧪 Testing assignment with driver: ${testDriver.firstName} ${testDriver.lastName}`
      );
      console.log(`   Driver ID: ${testDriver.id}`);
      console.log(`   User ID: ${testDriver.user.id}`);

      // Test URLs that should work:
      console.log('\n📱 Test URLs:');
      console.log(
        `   Driver Dashboard: http://localhost:3000/${org.clerkId}/drivers/${testDriver.user.id}`
      );
      console.log(
        `   Drivers List: http://localhost:3000/${org.clerkId}/drivers`
      );
      console.log(
        `   Dispatch Board: http://localhost:3000/${org.clerkId}/dispatch`
      );
    }
  } catch (error) {
    console.error('❌ Error testing assignment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAssignment();
