-เมื่อเรารันdocker composeไปเเล้ว container(ที่มีfrontend image, backend image)มันไปผูกกับ3001 
ทำให้ถ้าเราจะรันbackend node index.jsด้วย3001ไม่ได้เเล้ว

-backend: "node index.js"
-frontend: "npm run dev"

port
Frontendเป็น 3001
Api/Backend เป็น 5000
Sql เราใช้3307นะ เพราะเราใช้mysqlบนdocker