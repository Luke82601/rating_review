const reference = require('./reference');

// const { Pool } = require('pg')
// const pool = new Pool()
// await pool.connect()
// const res = await client.query('SELECT $1::text as message', ['Fuck you Postgres!'])
// console.log(res.rows[0].message) // Hello world!
// await client.end()

// export { res }

const { Pool } = require('pg')
const pool = new Pool({
  username: reference.username,
  host: reference.host,
  database: reference.database,
  password: reference.password,
  port: reference.port
})
pool.connect()
.then(console.log('Connected to Postgres'))
.catch(err => console.log(err));

const getAllReviewsById = (req, res) => {
  const { product_id } = req.params;
  const sql = `SELECT review_id AS review_id, product_id, rating, date, summary, body, recommend, reported,
  reviewer_name, reviewer_email, response, helpfulness,
  COALESCE((SELECT array_to_json(array_agg(row_to_json(p))) FROM
      (SELECT photo_id, url FROM reviews_photos WHERE reviews_photos.review_id = E.review_id)p
  ), '[]'::json) as photos
  FROM reviews E WHERE product_id = $1 AND reported = false`;
  pool.query(sql, [ product_id ], (err, result) => {
    if (err) { console.log(err); res.status(500).send(err);  }
    else ( res.status(200).send(result.rows) )
  })
  // .then(result => res.status(200).send(result.rows))
  // .catch(err => res.status(500).send(err))
};

const getMeta = (req, res) => {
  const { product_id } = req.params;
  const sql = `WITH rev_table AS (
    SELECT product_id, rating, recommend
    FROM reviews
    WHERE product_id = $1
    ), rate_table AS (
    SELECT json_object_agg(rating, counts ORDER BY rating) AS json
    FROM (SELECT rating, counts FROM
      (SELECT rating, COUNT(rating) AS counts
      FROM rev_table
      GROUP BY rating)w
      WHERE rating IS NOT NULL
      )q
    ), rec_table AS (
    SELECT json_object_agg(recommend, counts ORDER BY recommend) AS json
    FROM (SELECT recommend, COUNT(recommend) AS counts
      FROM rev_table
      GROUP BY recommend)p
    ), char_table AS (
    SELECT json_object_agg(name, json_build_object('id', id, 'value', value)) AS json
    FROM (SELECT characteristics.characteristic_id AS id, characteristics.name AS name,
        AVG(characteristic_review.value) AS value
      FROM characteristics LEFT JOIN characteristic_review
      ON characteristics.characteristic_id = characteristic_review.characteristic_id
    WHERE characteristics.product_id= $1
    GROUP BY characteristics.characteristic_id)t
    )
    SELECT $1 AS product_id, rate_table.json AS ratings, rec_table.json AS
 recommended,
      char_table.json AS characteristics
    FROM rate_table, rec_table, char_table`;
  pool.query(sql, [ product_id ], (err, result) => {
    if (err) { console.log(err); res.status(500).send(err);  }
    else ( res.status(200).send(result.rows) )
  })
  // .then(result => res.status(200).send(result.rows))
  // .catch(err => res.status(500).send(err))
};

const postReview = (req, res) => {
  const { product_id, rating, summary, body, recommend, name, email, photos, characteristics
  } = req.body;
  const photo_query_string = (photos.length > 0
    ? `, url_list AS (
      SELECT main_insert.review_id as review_id, json_array_elements('${JSON.stringify(photos)}')
        as url FROM main_insert
    ), photo_insert AS(
      INSERT INTO reviews_photos (review_id, url)
      SELECT review_id, url FROM url_list
    )`
    : '');
  const sql =
  `WITH main_insert AS (
    INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING review_id AS review_id
  )${photo_query_string}, characteristics_table AS (
    SELECT key::int AS char_id, value::int as char_value  from json_each_text('${JSON.stringify(characteristics)}')
  )
  INSERT INTO characteristic_review (characteristic_id, review_id, value)
  SELECT characteristics_table.char_id, main_insert.review_id, characteristics_table.char_value
  FROM characteristics_table, main_insert;`;

  pool.query(sql, [ product_id, rating, summary, body, recommend, name, email ], (err, result) => {
    if (err) { console.log(err); res.status(500).send(err);  }
    else ( res.status(201).send(result) )
  })
  // .then(result => res.status(200).send(result.rows))
  // .catch(err => res.status(500).send(err))
}

module.exports = {
  getAllReviewsById,
  postReview,
  getMeta
};




// `SELECT review_id AS review_id, rating, date, summary, body, recommend, reported,
//   reviewer_name, reviewer_email, response, helpfulness,
//   COALESCE((SELECT array_to_json(array_agg(row_to_json(p))) FROM
//       (SELECT photo_id, url FROM photos WHERE review_id = E.review_id)p
//   ), '[]'::json) as photos
//   FROM review E WHERE product_id = $1 AND reported = false`

// WITH review AS (
//   SELECT review_id, product_id, rating, date, summary, body, recommend, reported,
//   reviewer_name, reviewer_email, response, helpfulness FROM review where product_id = $1
// ), photos AS (
//   SELECT json_build_object(
//     'id', photo_id, 'url', url
//   ) AS photos FROM photos LEFT JOIN review ON photos.review_id_Review = review.review_id WHERE product_id = $1
//   ) SELECT $1 AS review, photos FROM review, photos


// `SELECT
//   review.review_id,
//   review.rating,
//   review.date,
//   review.summary,
//   review.body,
//   review.recommend,
//   review.reported,
//   review.reviewer_name,
//   review.reviewer_email,
//   review.response,
//   review.helpfulness,
//   array_agg(json_build_object('id', photo_id, 'url', url)) AS photos
// FROM
//   review
//     LEFT JOIN photos ON
//         review.review_id = photos.review_id_Review
//     WHERE product_id = $1
// GROUP BY
//   review.review_id,
//   review.rating,
//   review.date,
//   review.summary,
//   review.body,
//   review.recommend,
//   review.reported,
//   review.reviewer_name,
//   review.reviewer_email,
//   review.response,
//   review.helpfulness,
//   photos.photo_id,
//   photos.url`




// POST

// `WITH main_insert AS (
//   INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email )
//   VALUES (${product_id}, ${rating}, '${summary}', '${body}', ${recommend}, '${name}', '${email}')
//   RETURNING id AS review_id
// )${photo_query_string}, characteristics_table AS (
//   SELECT key::int AS char_id, value::int as char_value  from json_each_text('${JSON.stringify(characteristics)}')
// )
// INSERT INTO characteristic_review (characteristic_id, review_id, value)
// SELECT characteristics_table.char_id, main_insert.review_id, characteristics_table.char_value
// FROM characteristics_table, main_insert;`,
// );
// response.status(201).send(rows);
// }




// `WITH main_insert AS (
//   INSERT INTO review (product_id, rating, date, summary, body, recommend, reviewer_name, reviewer_email) VALUES ($1, $2, $3, '$4', $5, $6, '$7', '$8')
//   RETURNING id AS review_id)
// INSERT INTO chardata (character_id_Characteristics, review_id, value)
// SELECT characteristics_table.char_id, main_insert.review_id, characteristics_table.char_value
// FROM characteristics_table, main_insert`



// const postReview = async (request, response) => {
//   const {
//     product_id,
//     rating,
//     summary,
//     body,
//     recommend,
//     name,
//     email,
//     photos,
//     characteristics,
//   } = request.body;
//   const photo_query_string = (photos.length > 0
//     ? `, url_list AS (
//       SELECT main_insert.review_id as review_id, json_array_elements('${JSON.stringify(photos)}')
//         as url FROM main_insert
//     ), photo_insert AS(
//       INSERT INTO reviews_photos (review_id, url)
//       SELECT review_id, url FROM url_list
//     )`
//     : '');

//   try {
//     const { rows } = await pool.query(
//       `WITH main_insert AS (
//         INSERT INTO reviews (product_id, rating, summary, body, recommend, reviewer_name, reviewer_email )
//         VALUES (${product_id}, ${rating}, '${summary}', '${body}', ${recommend}, '${name}', '${email}')
//         RETURNING id AS review_id
//       )${photo_query_string}, characteristics_table AS (
//         SELECT key::int AS char_id, value::int as char_value  from json_each_text('${JSON.stringify(characteristics)}')
//       )
//       INSERT INTO characteristic_review (characteristic_id, review_id, value)
//       SELECT characteristics_table.char_id, main_insert.review_id, characteristics_table.char_value
//       FROM characteristics_table, main_insert;`,
//     );
//     response.status(201).send(rows);
//   }

