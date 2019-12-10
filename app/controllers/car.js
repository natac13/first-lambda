import R from 'ramda';
import aws from 'aws-sdk';
import uuid from 'uuid/v4';

const notEmpty = R.compose(R.not, R.isEmpty);

const handleError = ({
  expl = '',
  key = '',
  params = {},
  code = 400,
  error,
}) => {
  if (R.isNil(error) && R.equals(expl, '')) {
    console.log('Unknown or not passed in error.');
    return { statusCode: 501 };
  }
  // console.logs go to Cloudwatch
  console.log(`There was an error: ${expl}`);
  console.log(error);
  if (key !== '' && notEmpty(params)) {
    console.log(key, params);
  }

  return {
    statusCode: code,
  };
};

// WORKING
export const createCar = async (event) => {
  let bodyObj = {};
  try {
    bodyObj = JSON.parse(event.body);
  } catch (err) {
    // console.log is only printed to CloudWatch with lambda functions
    return handleError({ expl: 'Parsing post body.', error: err });
  }
  const { make, model, year } = bodyObj;

  if (R.isNil(make) || R.isNil(model) || R.isNil(year)) {
    return handleError({
      expl: 'Missing parameter(s)',
      code: 401,
      key: 'params',
      params: bodyObj,
    });
  }

  const id = uuid();
  const createdAt = new Date().getTime();
  const updatedAt = new Date().getTime();

  const putParams = {
    TableName: process.env.CAR_TABLE_NAME,
    Item: { id, make, model, year, createdAt, updatedAt },
  };

  let putResult = {};
  try {
    const dynadb = new aws.DynamoDB.DocumentClient();
    putResult = await dynadb.put(putParams).promise();
  } catch (err) {
    return handleError({
      expl: 'Creating Car',
      code: 500,
      key: 'putParams',
      params: putParams,
      error: err,
    });
  }
  console.log(JSON.stringify(putResult, null, 3));
  return {
    statusCode: 201,
  };
};

// WORKING
export const listCar = async (/* event, context */) => {
  const scanParams = {
    TableName: process.env.CAR_TABLE_NAME,
  };
  /* NOT FOR PRODUCTION, USE PAGINATION */

  let scanResult = {};
  try {
    const dynadb = new aws.DynamoDB.DocumentClient();
    scanResult = await dynadb.scan(scanParams).promise();
  } catch (err) {
    return handleError({
      expl: 'Listing Cars',
      code: 500,
      key: 'scanParams',
      params: scanParams,
    });
  }
  // console.log(JSON.stringify(scanResult, null, 3));
  if (R.isNil(scanResult.Items) || R.isEmpty(scanResult.Items)) {
    return {
      statusCode: 404,
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      R.map(R.pick(['id', 'make', 'model', 'year']))(scanResult.Items)
    ),
  };
};

// NOT WORKING
export const getCar = async (event) => {
  const { id } = event.pathParameters;
  const getParams = {
    TableName: process.env.CAR_TABLE_NAME,
    Key: { id },
  };

  let getResult = {};
  try {
    const dynadb = new aws.DynamoDB.DocumentClient();
    getResult = await dynadb.get(getParams).promise();
  } catch (err) {
    return handleError({
      expl: 'Getting a Car',
      code: 500,
      key: 'getParams',
      params: getParams,
    });
  }

  if (R.isNil(getResult.Items[0])) {
    return handleError({ expl: `Cannot find Car with id = ${id} `, code: 404 });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(R.pick(['make', 'model', 'year'])(getResult.Items[0])),
  };
};

// NOT WORKING
export const updateCar = async (event) => {
  let bodyObj = {};
  try {
    bodyObj = JSON.parse(event.body);
  } catch (err) {
    // console.log is only printed to CloudWatch with lambda functions
    return handleError({ expl: 'Parsing post body.', error: err });
  }

  const { id } = event.pathParameters;
  const { make, model, year } = bodyObj;
  const values = {};
  if (make) {
    values[':make'] = make;
  }
  if (model) {
    values[':model'] = model;
  }
  if (year) {
    values[':year'] = year;
  }
  const updateParams = {
    TableName: process.env.CAR_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      'set #make = :make, set #model = :model, set #year = :year',
    ExpressionAttributeName: {
      '#make': 'make',
      '#model': 'model',
      '#year': 'year',
    },
    ExpressionAttributeValues: values,
  };

  try {
    const dynadb = new aws.DynamoDB.DocumentClient();
    await dynadb.update(updateParams).promise();
    return { statusCode: 200 };
  } catch (err) {
    return handleError({
      expl: 'Updating a Car',
      code: 500,
      key: 'updateParams',
      params: updateParams,
    });
  }
};

// NOT WORKING
export const deleteCar = async (event) => {
  const { id } = event.pathParameters;
  const deleteParams = {
    TableName: process.env.CAR_TABLE_NAME,
    Key: { id },
  };

  try {
    const dynadb = new aws.DynamoDB.DocumentClient();
    dynadb.delete(deleteParams).promise();
    return { statusCode: 200 };
  } catch (err) {
    return handleError({
      expl: 'Deleting a Car',
      code: 500,
      key: 'deleteParams',
      params: deleteParams,
    });
  }
};
