import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.salarySlip.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.document.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Hash password for all test users
  const password = await bcrypt.hash('Test@123', 10);

  // Create HR Admin
  const hrUser = await prisma.user.create({
    data: {
      employeeId: 'EMP001',
      email: 'hr@dayflow.com',
      password,
      role: 'HR',
      emailVerified: true,
      employee: {
        create: {
          firstName: 'HR',
          lastName: 'Admin',
          fullName: 'HR Admin',
          designation: 'HR Manager',
          department: 'Human Resources',
          joiningDate: new Date('2023-01-01'),
          phone: '+1234567890',
          address: '123 Business St',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
        },
      },
    },
  });

  console.log('✅ Created HR Admin');

  // Create test employees
  const employees = [];
  for (let i = 1; i <= 10; i++) {
    const emp = await prisma.user.create({
      data: {
        employeeId: `EMP${String(i + 1).padStart(3, '0')}`,
        email: `employee${i}@dayflow.com`,
        password,
        role: 'EMPLOYEE',
        emailVerified: true,
        employee: {
          create: {
            firstName: `Employee`,
            lastName: `${i}`,
            fullName: `Employee ${i}`,
            designation: ['Software Engineer', 'Senior Engineer', 'Team Lead', 'QA Engineer', 'Product Manager'][i % 5],
            department: ['Engineering', 'Engineering', 'Engineering', 'QA', 'Product'][i % 5],
            joiningDate: new Date(`2023-${String((i % 12) + 1).padStart(2, '0')}-01`),
            phone: `+91${9000000000 + i}`,
            address: `${i * 10} Employee Lane`,
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
          },
        },
      },
    });
    employees.push(emp);
  }

  console.log('✅ Created 10 employees');

  // Create payroll for all employees
  for (const emp of employees) {
    const employee = await prisma.employee.findUnique({
      where: { userId: emp.id },
    });

    if (employee) {
      const basicSalary = 50000 + Math.floor(Math.random() * 50000);
      const hra = basicSalary * 0.4;
      const transport = 3000;
      const medical = 2000;
      const pf = basicSalary * 0.12;
      const tax = basicSalary * 0.1;

      await prisma.payroll.create({
        data: {
          employeeId: employee.id,
          basicSalary,
          hra,
          transportAllowance: transport,
          medicalAllowance: medical,
          providentFund: pf,
          tax,
          grossSalary: basicSalary + hra + transport + medical,
          netSalary: basicSalary + hra + transport + medical - pf - tax,
          bankName: 'HDFC Bank',
          accountNumber: `${employee.id.slice(-8)}`,
        },
      });
    }
  }

  console.log('✅ Created payroll for all employees');

  // Create attendance records for the last 7 days
  const today = new Date();
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);

    for (const emp of employees) {
      const employee = await prisma.employee.findUnique({
        where: { userId: emp.id },
      });

      if (employee) {
        const checkIn = new Date(date);
        checkIn.setHours(9, Math.floor(Math.random() * 30), 0);

        const checkOut = new Date(date);
        checkOut.setHours(17 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60), 0);

        const workHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        await prisma.attendance.create({
          data: {
            employeeId: employee.id,
            date,
            status: 'PRESENT',
            checkInTime: checkIn,
            checkOutTime: checkOut,
            workHours,
          },
        });
      }
    }
  }

  console.log('✅ Created attendance records for the last 7 days');

  // Create some leave requests
  const firstEmployee = await prisma.employee.findUnique({
    where: { userId: employees[0].id },
  });

  if (firstEmployee) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: firstEmployee.id,
        leaveType: 'PAID',
        status: 'PENDING',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        totalDays: 3,
        reason: 'Family vacation',
      },
    });

    await prisma.leaveRequest.create({
      data: {
        employeeId: firstEmployee.id,
        leaveType: 'SICK',
        status: 'APPROVED',
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        totalDays: 2,
        reason: 'Medical checkup',
        reviewedBy: hrUser.id,
        reviewedAt: new Date(),
        reviewComments: 'Approved. Take care!',
      },
    });
  }

  console.log('✅ Created sample leave requests');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\nTest Accounts:');
  console.log('HR Admin:     hr@dayflow.com / Test@123');
  console.log('Employee 1:   employee1@dayflow.com / Test@123');
  console.log('Employee 2:   employee2@dayflow.com / Test@123');
  console.log('...');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
