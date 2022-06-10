'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

//Tables

module.exports = (sequelize, DataTypes) => {
	var Assignments = sequelize.define('Assignments',{
		// assignment_id: {
		// 	type: DataTypes.INTEGER,
		// 	autoincrement: true,
		// 	primaryKey: true
		// },
		name:{
			type: DataTypes.STRING //varchar(255)	
		},
		category:{
			type: DataTypes.STRING
		}
	});

	var Sem = sequelize.define('Semesters', {
		sem_id:{
			type: DataTypes.STRING,
			unique: true,
			defaultValue: false,
			primaryKey: true
		}
	});



	var Assign_Sem = sequelize.define('Assignments_Semesters',{
		start_date:{
			type: DataTypes.DATE,
			allowNull: false
		},
		end_date:{
			type: DataTypes.DATE,
			allowNull: false
		},
		assignmentId:{
			type: DataTypes.INTEGER,
			references:{
				model: Assignments,
				key: 'id'
			}
		},
		semesterId:{
			type: DataTypes.INTEGER,
			references:{
				model: Semesters,
				key: 'sem_id'
			}
		}
	});

	//Assignments and Semesters Relationship
	Assignments.belongsToMany(Semesters, {through: Assign_Sem });
	Semesters.belongsToMany(Assignments, {through: Assign_Sem });


	var Users = sequelize.define('Users', {
		// user_id:{
		// 	type: DataTypes.INTEGER,
		// 	autoincrement:true,
		// 	primaryKey:true
		// },
		email:{
			type: DataTypes.STRING,
			defaultValue: false,
			unique: true
		},
		fname:{
			type: DataTypes.STRING,
			defaultValue: false
		},
		lname:{
			type: DataTypes.STRING,
			defaultValue: false
		},
		access_token:{
			type: DataTypes.STRING,
			defaultValue: false
		}
	});

	//Semester and Users relationship
	// var Sem_users = sequelize.define('Semesters_Users', {});
	Semesters.belongsToMany(Users, {through: 'Semester_Users'});
	Users.belongsToMany(Semesters, {through: 'Senester_Users'});


	var Students = sequelize.define('Students', {
		num_questions:{
			type: DataTypes.BIGINT
		},
		time_on_queue:{
			type: DataTypes.BIGINT //minutes??
		}
	});


	var TA = sequelize.define('TAs', {
		is_admin:{
			type: DataType.BOOLEAN
		},
		zoom_url:{
			type: DataTypes.STRING
		},
		num_helped:{
			type: DataTypes.BIGINT
		},
		time_helped:{
			type: DataTypes.BIGINT
		}
	});


	//TA and Student relationship with Users
	TA.hasOne(Users, {
		foreignKey: 'id'
	});
	Users.belongsTo(TA);

	Students.hasOne(Users, {
		foreignKey: 'id'
	});
	Users.belongsTo(Students);

	var Questions = sequelize.define('Questions', {
		question:{
			types:DataTypes.TEXT
		},
		tried_so_far:{
			types:DataTypes.TEXT
		},
		location:{
			type: DataTypes.STRING,
			defaultValue:false
		},
		assignment:{
			type: DataTypes.STRING,
			defaultValue:false
		},
		entry_time:{
			type: DataTypes.DATE
		},
		help_time:{
			type: DataTypes.DATE
		},
		exit_time:{
			type: DataTypes.DATE
		},
		num_ask_to_fix:{
			type: DataTypes.INTEGER
		}
	})

	//Questions relationship with TA, Student, Semester
	Questions.hasMany(TA, {
		foreignkey: ''
	});

	Questions.hasMany(Students, {
		foreignkey: ''
	});

	Questions.hasMany(Semesters, {
		foreignkey: 'sem_id'
	});

	TA.belongsTo(Questions);
	Students.belongsTo(Questions);
	Semesters.belongsTo(Questions);




};
