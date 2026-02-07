const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const Lead = sequelize.define('Lead', {
    business_name: { type: DataTypes.STRING, allowNull: false },
    decision_maker_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    website: { type: DataTypes.STRING },
    industry: { type: DataTypes.STRING },
    status: {
        type: DataTypes.ENUM('Pending', 'Sent', 'Replied', 'Meeting Scheduled', 'No Response', 'Not Interested', 'Follow-up Sent', 'Campaign Ended'),
        defaultValue: 'Pending'
    }
});

const Email = sequelize.define('Email', {
    subject: { type: DataTypes.STRING },
    body: { type: DataTypes.TEXT },
    sent_at: { type: DataTypes.DATE },
    ai_generated: { type: DataTypes.BOOLEAN, defaultValue: true },
    email_type: {
        type: DataTypes.ENUM('initial', 'follow-up', 'reply'),
        defaultValue: 'initial'
    }
});

const Response = sequelize.define('Response', {
    response_text: { type: DataTypes.TEXT },
    received_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    sentiment: {
        type: DataTypes.ENUM('positive', 'negative', 'neutral'),
        allowNull: false
    }
});

const Meeting = sequelize.define('Meeting', {
    scheduled_time: { type: DataTypes.DATE },
    meeting_link: { type: DataTypes.STRING },
    status: {
        type: DataTypes.ENUM('Pending', 'Confirmed', 'Cancelled'),
        defaultValue: 'Pending'
    }
});

// Relationships
Lead.hasMany(Email);
Email.belongsTo(Lead);

Lead.hasMany(Response);
Response.belongsTo(Lead);

Lead.hasMany(Meeting);
Meeting.belongsTo(Lead);

const initDb = async () => {
    await sequelize.sync({ force: false });
    console.log('Database synced');
};

module.exports = { sequelize, Lead, Email, Response, Meeting, initDb };
