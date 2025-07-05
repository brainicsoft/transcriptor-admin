module.exports = {
  apps: [
    {
      name: "transcriptor-admin",
      script: "pnpm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000, // যদি অন্য port লাগে, এখানে সেটাও দিতে পারো
      },
    },
  ],
};
