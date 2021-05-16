-- REVOKE CONNECT ON DATABASE reviews FROM public;
-- SELECT pg_terminate_backend(pg_stat_activity.pid)
-- FROM pg_stat_activity
-- WHERE pg_stat_activity.datname = 'reviews';

-- CREATE SCHEMA IF NOT EXISTS rr;

DROP DATABASE IF EXISTS rate_review;
CREATE DATABASE rate_review;
\c rate_review;


CREATE TABLE reviews (
 review_id BIGSERIAL NOT NULl,
 product_id INTEGER,
 rating INTEGER,
 date DATE,
 summary VARCHAR(255),
 body VARCHAR(500),
 recommend BOOLEAN,
 reported BOOLEAN,
 reviewer_name VARCHAR(50),
 reviewer_email VARCHAR(50),
 response VARCHAR(255),
 helpfulness INTEGER
);


ALTER TABLE reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);

CREATE TABLE reviews_photos (
 photo_id BIGSERIAL NOT NULL,
 review_id INTEGER,
 url VARCHAR(255)
);


ALTER TABLE reviews_photos ADD CONSTRAINT reviews_photos_pkey PRIMARY KEY (photo_id);

CREATE TABLE characteristic_review (
 id BIGSERIAL NOT NULL,
 characteristic_id INTEGER,
 review_id INTEGER,
 value INTEGER
);


ALTER TABLE characteristic_review ADD CONSTRAINT characteristic_review_pkey PRIMARY KEY (id);

CREATE TABLE characteristics (
 characteristic_id BIGSERIAL NOT NULL,
 product_id INTEGER,
 name VARCHAR
);


ALTER TABLE characteristics ADD CONSTRAINT characteristics_pkey PRIMARY KEY (characteristic_id);

ALTER TABLE reviews_photos ADD CONSTRAINT reviews_photos_review_id_fkey FOREIGN KEY (review_id) REFERENCES reviews(review_id);
ALTER TABLE characteristic_review ADD CONSTRAINT characteristic_review_characteristic_id_fkey FOREIGN KEY (characteristic_id) REFERENCES characteristics(characteristic_id);
ALTER TABLE characteristic_review ADD CONSTRAINT characteristic_review_review_id_fkey FOREIGN KEY (review_id) REFERENCES reviews(review_id);


COPY reviews
FROM '/Users/luke82601/hrsea16/Reviews/reviews.csv'
DELIMITER ','
CSV HEADER;

COPY characteristics
FROM '/Users/luke82601/hrsea16/Reviews/characteristics.csv'
DELIMITER ','
CSV HEADER;

COPY characteristic_review
FROM '/Users/luke82601/hrsea16/Reviews/characteristic_reviews.csv'
DELIMITER ','
CSV HEADER;

COPY reviews_photos
FROM '/Users/luke82601/hrsea16/Reviews/reviews_photos.csv'
DELIMITER ','
CSV HEADER;




-- REVIEW
CREATE INDEX review_id_index ON reviews(review_id);
CREATE INDEX product_id_index ON reviews(product_id);
CREATE INDEX rating_index ON reviews(rating);
CREATE INDEX recommend_index ON reviews(recommend);

-- CHARACTERISTICS
CREATE INDEX characteristic_id_index ON characteristics(characteristic_id);
CREATE INDEX name_index ON characteristics(name);

-- PHOTOS
CREATE INDEX photo_id_index ON reviews_photos(photo_id);
CREATE INDEX url_index ON reviews_photos(url);

-- CHARDATA
CREATE INDEX value_index ON characteristic_review(value);
