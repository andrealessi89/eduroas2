module.exports = {
  apps: [
    {
      name: 'dashpro-backend',
      cwd: './backend-webhook',
      script: 'npm',
      args: 'run dev',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: './backend.log',
      out_file: './backend.log',
      merge_logs: true
    },
    {
      name: 'dashpro-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3333
      },
      error_file: './frontend.log',
      out_file: './frontend.log',
      merge_logs: true
    }
  ]
};