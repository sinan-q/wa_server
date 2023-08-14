var config = {
	debug: false,
	database: {
	    connectionLimit: 500,
	    host: "localhost",
	    user: "wap",
	    password: "wap",
	    database: "wap",
	    charset : "utf8mb4",
	    debug: false,
	    waitForConnections: true,
	    multipleStatements: true
	},
	cors: {
		origin: '*',
 		optionsSuccessStatus: 200
	}
}

module.exports = config; 