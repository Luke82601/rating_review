import http from 'k6/http';
import { sleep } from 'k6';

export default function() {
  http.get('http://localhost:3000/api/reviews/20100');
  sleep(1);
  http.get('http://localhost:3000/api/reviews/20101');
  sleep(1);
  http.get('http://localhost:3000/api/reviews/20102');
  sleep(1);
  http.get('http://localhost:3000/api/reviews/20103');
  sleep(1);
  http.get('http://localhost:3000/api/reviews/20104');
 }
