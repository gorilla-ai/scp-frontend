import React from "react";

const constants = {
	soc: {
		// incident limit account
		LIMIT_ACCOUNT: 1,
		NONE_LIMIT_ACCOUNT: 2,
		CHECK_ERROR: 3,
		// incident event type and action type
		INCIDENT_STATUS_ALL: 0,
		INCIDENT_STATUS_UNREVIEWED: 1,
		INCIDENT_STATUS_REVIEWED: 2,
		INCIDENT_STATUS_CLOSED: 3,
		INCIDENT_STATUS_SUBMITTED: 4,
		INCIDENT_STATUS_DELETED: 5,
		INCIDENT_STATUS_ANALYZED: 6,
		INCIDENT_STATUS_EXECUTOR_UNREVIEWED: 7,
		INCIDENT_STATUS_EXECUTOR_CLOSE: 8,
		// soc rule
		SOC_Analyzer: 'SOC Analyzer',
		SOC_Executor: 'SOC Executor',
		SOC_Super: 'SOC Supervisor',
		SOC_Ciso: 'SOC CISO',
		SOC_NORMAL_Super: 'SOC單位設備承辦人',
		SOC_NORMAL_Ciso: 'SOC單位設備資安長',
		Default_Admin: 'Default Admin Privilege',
		// incident Device
		SEND_STATUS_DEFAULT_SUCCESS: 0,
		SEND_STATUS_SUCCESS: 1,
		SEND_STATUS_ERROR_NOT_CONNECT_NCCST: 2,
		SEND_STATUS_ERROR_NOT_READY_INCIDENT: 3,
		SEND_STATUS_ERROR_OTHER: 4,
	}
};

export default constants;