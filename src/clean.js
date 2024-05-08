import mariadb from 'mariadb';

const connection = await mariadb.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'conduit',
    port: parseInt(process.env.DB_PORT || '3306'),
});

await connection.beginTransaction();
await connection.query(`DELETE
                        FROM comment;`);
await connection.query(`DELETE
                        FROM article;`);
await connection.query(`DELETE
                        FROM tag;`);
await connection.query(`DELETE
                        FROM user;`);
await connection.query(`DELETE
                        FROM user_favorites;`);
await connection.query(`DELETE
                        FROM user_to_follower;`);
await connection.commit();
await connection.end();