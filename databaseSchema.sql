zone_name
-
id int PK
zone_name varchar(50) 
no_of_polygons int 

zone_points
-
id int PK
zone_name_id int FK  - zone_name.zone_name
x_value double
y_value double
polygon_number


newest_updated_dates
-
service_name varchar(50)
newest_updated_date timestamp
status varchar(10)
status_updated_date timestamp
cron_expression varchar(15)

zone_lmp
-
zone_lmp_id bigint PK
name varchar(100)
type varchar(100)
updated_timestamp timestamp
price float(10,2)

tieflow
-
tieflow_id bigint PK
data_source varchar(50)
name varchar(50)
time_stamp timestamp
value float
error_code_id int

demand_graph
-
id int PK
demand_graph_name varchar(50)

demand_graph_points
-
id bigint PK
mw_in_thousands float(10,2)
demand_graph_id int FK  - demand_graph.id
updated_timestamp timestamp

mobile_data
-
id bigint PK
udid varchar(100)
token varchar(200)
notification_enabled_flag boolean
badge_count bigint
device_platform varchar(30)
device_model varchar(30)
device_version varchar(30)
created_timestamp timestamp
last_modified_timestamp timestamp
client_ip varchar(30)

page
-
id bigint PK
page_name varchar(40)

analytic_data
-
id bigint PK
udid varchar(100) FK  - mobile_data.udid
created_timestamp timestamp
page_id bigint FK  - page.id
time_in_seconds bigint
updated_timestamp timestamp

app_opens_data
-
udid varchar(100) FK  - mobile_data.udid
created_timestamp timestamp
total_app_opens bigint
total_app_opens_triggered_by_pushes bigint
updated_timestamp timestamp

crash_data
-
udid varchar(100) FK  - mobile_data.udid
crash_file_info mediumblob,
created_timestamp timestamp
given_timestamp timestamp

user_feedback
-
udid varchar(100) FK  - mobile_data.udid
feedback_text text
created_timestamp timestamp
given_timestamp timestamp

device_zone_data
-
udid varchar(100) FK  - mobile_data.udid
zone_name varchar(100) PK
threshold_value double
notification_enabled_flag boolean
previous_zone_LMP_below_flag boolean
created_timestamp timestamp
last_modified_timestamp timestamp

push_notification_data
-
udid varchar(100) FK  - mobile_data.udid
created_timestamp timestamp

alert_message
-
id bigint PK
udid varchar(100) FK  - mobile_data.udid
subject varchar(200)
message text
zone_names varchar(200)
created_timestamp timestamp

emergency_message
-
id bigint PK
message_id bigint
message_type varchar(200)
canceled_timestamp timestamp
message text
pjm_drill boolean
pjm_cp boolean
priority varchar(20)
applicable_start_time timestamp
applicable_end_time timestamp
effective_start_time timestamp
effective_end_time timestamp
newest_updated_date timestamp

region_type
-
region_type_id bigint PK
name varchar(20)

region_data
-
region_id bigint PK
display_flag boolean
name varchar(20)
description varchar(150)
order_no int
fk_region_type_id bigint FK - region_type.region_type_id

emergency_message_region_data
-
emergency_message_region_data_id bigint PK
fk_emergency_message_id bigint FK - emergency_message.id
fk_region_id bigint FK - region_data.region_id

state
-
state_code varchar(3) PK
state_name varchar(20)

region_state
-
fk_region_id bigint FK - region_data.region_id
fk_state_code varchar(3) FK - state.state_code

emergency_message_type
-
emergency_message_type_id bigint PK
default_select boolean
definition text
end_comments text
include_flag boolean
incl_govt_agency_flag boolean
emergency_message_type_name varchar(50)
trans_impact_flag boolean
fk_message_priority_id int
create_timestamp timestamp
created_by varchar(10)
update_timestamp timestamp
updated_by varchar(10) 
pah_flag boolean
message_prefix varchar(5) 

device_emergency_message_data
-
id bigint PK
udid varchar(100) FK - mobile_data.udid
fk_emergency_message_id bigint FK - emergency_message.id
is_read boolean

device_region_data
-
udid varchar(100) FK - mobile_data.udid 
fk_region_id bigint FK - region_data.region_id
selection_flag boolean

device_state_data
-
udid varchar(100) FK - mobile_data.udid 
fk_state_code varchar(3) FK - state.state_code
selection_flag boolean

device_emergency_message_type_data
-
udid varchar(100) FK - mobile_data.udid 
fk_emergency_message_type_id bigint FK - emergency_message_type.emergency_message_type_id
selection_flag boolean

admin_users
-
adminuser_id INT(11) PK
email_id VARCHAR(45)
password VARCHAR(45)
first_name VARCHAR(45)
last_name VARCHAR(45)
isactive TINYINT(4)
login_time TIMESTAMP
last_access_time TIMESTAMP

special_messages
-
message_id INT(11) PK
message_title VARCHAR(200)
message_content` TEXT
start_date` TIMESTAMP
end_date` TIMESTAMP
posted_by` INT(11)
posted_timestamp` TIMESTAMP
updated_by` INT(11)
updated_timestamp` TIMESTAMP
created_timestamp` TIMESTAMP
ispushnotification_sent` TINYINT(4)

oauth_access_token
-
token_id VARCHAR(256)
token MEDIUMBLOB
authentication_id VARCHAR(256)
user_name VARCHAR(256)
client_id VARCHAR(256)
authentication MEDIUMBLOB
refresh_token VARCHAR(256)

oauth_client_details
-
client_id VARCHAR(10) PK
resource_ids VARCHAR(10)
client_secret VARCHAR(10)
scope VARCHAR(20)
authorized_grant_types VARCHAR(100)
web_server_redirect_uri VARCHAR(40)
authorities VARCHAR(40)
access_token_validity INT(11)
refresh_token_validity INT(11)
additional_information VARCHAR(256)
autoapprove VARCHAR(256)

oauth_refresh_token
-
token_id VARCHAR(256)
token MEDIUMBLOB
authentication MEDIUMBLOB

operational_reserves
-
reserve_type VARCHAR(200)
rto_mw double(11,2)
mad_mw double(11,2)
dom_mw double(11,2)

dispatched_reserves
-
reserve_type VARCHAR(200)
rto_mw double(11,2)
mad_mw double(11,2)

special_messages_sequence
-
message_id INT PK

application_properties
-
prop_name varchar(50) PK
prop_value varchar(50)
updated_timestamp timestamp










