//This is the only dependency for this module.
const mysql = require('mysql');

/**
 * @class Database
 * 
 * Mysql Database class 
 *  
 * @property {Object} connection
 * @property {object} pool
 * @property {string} tableName
 * @property {array}  whereArray
 * @property {array}  orWhereArray
 * @property {array} whereBetweenArray
 * @property {array} orWhereBetweenArray
 * @property {array} whereNotBetweenArray
 * @property {array} orWhereNotBetweenArray
 * @property {array} whereInArray
 * @property {array} whereNotInArray
 * @property {array} orWhereInArray
 * @property {array} orwhereNotInArray
 * @property {array} whereNullArray
 * @property {array} orWhereNullArray
 * @property {array} whereNotNullArray
 * @property {array} orWhereNotNullArray
 * @property {array|string} selections
 * @property {string} distinctClause
 * @property {number} findId
 * @property {string} orderType
 * @property {string} orderColumn
 * @property {boolean} fetchFirst
 * @property {boolean} existsQuery
 * @property {array} joins
 * @property {array} leftJoins
 * @property {array} rightJoins
 * @property {string} groupByColumn
 * @property {array} havingArray
 * @property {number} limitNumber
 * @property {number} offsetNumber
 * @property {boolean} hasCount
 */

class Database {
  constructor() {
    this.connection     = null;
    this.pool           = null;
    this.tableName      = null;
    this.whereArray     = [];
    this.orWhereArray   = [];
    this.whereBetweenArray = [];
    this.orWhereBetweenArray = [];
    this.whereNotBetweenArray = [];
    this.orWhereNotBetweenArray = [];
    this.whereInArray = [];
    this.whereNotInArray = [];
    this.orWhereInArray = [];
    this.orWhereNotInArray = [];
    this.whereNullArray = [];
    this.orWhereNullArray = [];
    this.whereNotNullArray = [];
    this.orWhereNotNullArray = [];
    this.selections     = '*';
    this.distinctClause = '';
    this.findId         = null;
    this.orderType      = null;
    this.orderColumn    = null;
    this.fetchFirst     = false;
    this.existsQuery    = false;
    this.joins          = [];
    this.leftJoins      = [];
    this.rightJoins     = [];
    this.groupByColumn  = null;
    this.havingArray    = [];
    this.limitNumber    = null;
    this.offsetNumber   = null;
    this.hasCount       = false;
  }

  /**
   * First function to connect database
   * 
   * The parameters are the same with mysql library.
   * 
   * @link https://www.npmjs.com/package/mysql#connection-options
   * 
   * @param {Object} params
   * @return {Object} - Promise
   */
  connect = params => {
    return new Promise( (resolve, reject) => {
      this.createConnection(params);
      this.connection.connect(function(err) {
        if (err) {
          reject(err.stack);
        }
        resolve({
          message : 'Connected to MySql Database',
          success : true
        });
      });
    });
  }

  /**
   * @param {Object} params
   * @return {void}
   */
  createConnection = (params) => {
    let connection  =  mysql.createConnection(params);
    this.connection = connection;
  }

  /**
   * Close the connection
   * 
   * @return {void}
   */
  end = () => {
    this.connection.end();
  }

  /**
   * @param {object} params
   * @return {void}
   */
  createPool = (params) => {
    let pool = mysql.createPool(params);
    this.pool = pool;
  }

  /**
   * @return {object} - Promise
   */
  getPoolConnection = () => {
    let self = this;
    return new Promise( (resolve, reject) => {
      self.pool.getConnection(function(err, connection) {
        if (err) {
          reject(err);
        }
        self.connection = connection;
        resolve(connection);
      });
    });
  };

  /**
   * @return {void}
   */
  releasePool = () => {
    this.connection.release();
  };

  /**
   * Creates join statement if any and returns it
   * 
   * this.joins is an array of objects. Each object has 4 keys : 
   *  0 : table
   *  1 : column1
   *  2 : operation
   *  3 : column2
   * 
   * @return {string}
   */
  getJoinStatement = () => {
    let joinStatement = '';

    if(this.tableName != null && this.tableName != undefined && this.joins.length) {
      for (let index = 0; index < this.joins.length; index++) {
        joinStatement += ' INNER JOIN '+this.joins[index][0]+' ON '+this.joins[index][1] + ' '+this.joins[index][2] + ' ' + this.joins[index][3]+' ';
      }
    }

    if(this.tableName != null && this.tableName != undefined && this.leftJoins.length) {
      for (let index = 0; index < this.leftJoins.length; index++) {
        joinStatement += ' LEFT JOIN '+this.leftJoins[index][0]+' ON '+this.leftJoins[index][1] + ' '+this.leftJoins[index][2] + ' ' + this.leftJoins[index][3]+' ';
      }
    }

    if(this.tableName != null && this.tableName != undefined && this.rightJoins.length) {
      for (let index = 0; index < this.rightJoins.length; index++) {
        joinStatement += ' RIGHT JOIN '+this.rightJoins[index][0]+' ON '+this.rightJoins[index][1] + ' '+this.rightJoins[index][2] + ' ' + this.rightJoins[index][3]+' ';
      }
    }

    return joinStatement;
  }

  /**
   * Creates where statement if any and returns it
   *
   * @return {string}
   */
  getWhereStatement = () => {
    let whereStatement = '';
    if(this.whereArray.length != 0 ) {
      whereStatement = ' WHERE ';
      for (let index = 0; index < this.whereArray.length; index++) {
        let parts =  this.whereArray[index] ;
        whereStatement +=  parts[0] + ' ' + parts[1] + ' "' + parts[2] + '" '; 
        if(index != this.whereArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    } 

    if(this.whereBetweenArray.length != 0 ) {
      whereStatement = whereStatement == '' ? ' WHERE ' : whereStatement + ' AND ';
      for (let index = 0; index < this.whereBetweenArray.length; index++) {
        let parts =  this.whereBetweenArray[index] ;
        whereStatement +=  parts[0] + ' BETWEEN ' + parts[1] + ' AND ' + parts[2]; 
        if(index != this.whereBetweenArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    }

    if(this.whereNotBetweenArray.length != 0 ) {
      whereStatement = whereStatement == '' ? ' WHERE ' : whereStatement + ' AND ';
      for (let index = 0; index < this.whereNotBetweenArray.length; index++) {
        let parts =  this.whereNotBetweenArray[index] ;
        whereStatement +=  parts[0] + ' NOT BETWEEN ' + parts[1] + ' AND ' + parts[2]; 
        if(index != this.whereNotBetweenArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    }

    if(this.whereInArray.length != 0 ) {
      whereStatement = whereStatement == '' ? ' WHERE ' : whereStatement + ' AND ';
      for (let index = 0; index < this.whereInArray.length; index++) {
        let parts =  this.whereInArray[index] ;
        let inValues = parts[1].map(x => "'" + x + "'").toString();

        whereStatement +=  parts[0] + ' IN( ' + inValues + ')'; 
        if(index != this.whereInArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    }

    if(this.whereNotInArray.length != 0 ) {
      whereStatement = whereStatement == '' ? ' WHERE ' : whereStatement + ' AND ';
      for (let index = 0; index < this.whereNotInArray.length; index++) {
        let parts =  this.whereNotInArray[index] ;
        let inValues = parts[1].map(x => "'" + x + "'").toString();

        whereStatement +=  parts[0] + ' NOT IN( ' + inValues + ')'; 
        if(index != this.whereNotInArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    }

    if(this.whereNullArray.length != 0 ) {
      whereStatement = whereStatement == '' ? ' WHERE ' : whereStatement + ' AND ';
      for (let index = 0; index < this.whereNullArray.length; index++) {
        whereStatement +=  this.whereNullArray[index] + ' IS NULL '; 

        if(index != this.whereNullArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    }

    if(this.whereNotNullArray.length != 0 ) {
      whereStatement = whereStatement == '' ? ' WHERE ' : whereStatement + ' AND ';
      for (let index = 0; index < this.whereNotNullArray.length; index++) {
        whereStatement +=  this.whereNotNullArray[index] + ' IS NOT NULL '; 

        if(index != this.whereNotNullArray.length - 1 ) {
          whereStatement = whereStatement + ' AND ';
        }
      }
    }

    if(this.orWhereArray.length != 0 ) {
      for (let index = 0; index < this.orWhereArray.length; index++) {
        let parts =  this.orWhereArray[index] ;
        whereStatement +=  ' OR ' + parts[0] + ' ' + parts[1] + ' "' + parts[2] + '" '; 
      }
    }

    if(this.orWhereBetweenArray.length != 0 ) {
      for (let index = 0; index < this.orWhereBetweenArray.length; index++) {
        let parts =  this.orWhereBetweenArray[index] ;
        whereStatement +=  ' OR ' + parts[0] + ' BETWEEN ' + parts[1] + ' AND ' + parts[2]; 
      }
    }

    if(this.orWhereNotBetweenArray.length != 0 ) {
      for (let index = 0; index < this.orWhereNotBetweenArray.length; index++) {
        let parts =  this.orWhereNotBetweenArray[index] ;
        whereStatement +=  ' OR ' + parts[0] + ' NOT BETWEEN ' + parts[1] + ' AND ' + parts[2]; 
      }
    }

    if(this.orWhereInArray.length != 0 ) {
      for (let index = 0; index < this.orWhereInArray.length; index++) {
        let parts =  this.orWhereInArray[index] ;
        let inValues = parts[1].map(x => "'" + x + "'").toString();

        whereStatement +=  ' OR ' + parts[0] + ' IN( ' + inValues + ')'; 
      }
    }

    if(this.orWhereNotInArray.length != 0 ) {
      for (let index = 0; index < this.orWhereNotInArray.length; index++) {
        let parts =  this.orWhereNotInArray[index] ;
        let inValues = parts[1].map(x => "'" + x + "'").toString();

        whereStatement +=  ' OR ' + parts[0] + ' NOT IN( ' + inValues + ')'; 
      }
    }

    if(this.orWhereNullArray.length != 0 ) {
      for (let index = 0; index < this.orWhereNullArray.length; index++) {
        whereStatement +=  ' OR ' + this.orWhereNullArray[index] + ' IS NULL '; 
      }
    }

    if(this.orWhereNotNullArray.length != 0 ) {
      for (let index = 0; index < this.orWhereNotNullArray.length; index++) {
        whereStatement +=  ' OR ' + this.orWhereNotNullArray[index] + ' IS NOT NULL '; 
      }
    }

    // If selection is done with id
    if(this.findId != null) {
      whereStatement = ' WHERE id = ' + this.findId;
    }
    return whereStatement;
  }

  /**
   * Creates group by statement if any and returns it
   *
   * @return {string}
   */
  getGroupByStatement = () => {
    let groupByStatement = '';
    if(this.groupByColumn != null) {
      groupByStatement += ' GROUP BY ' + this.groupByColumn;
    }
    return groupByStatement;
  }

  /**
   * Creates having statement if any and returns it
   *
   * @return {string}
   */
  getHavingStatement = () => {
    let havingStatement = '';
    if(this.havingArray.length != 0) {
      havingStatement += ' HAVING ' +  this.havingArray[0] + ' ' + this.havingArray[1] + ' "' + this.havingArray[2] + '" ';
    }
    return havingStatement;
  }

  /**
   * Creates order by statement if any and returns it
   *
   * @return {string}
   */
  getOrderByStatement = () => {

    let orderByStatement = '';
    if(this.orderType != null && this.orderColumn != null) {
      orderbyStatement = ` ORDER BY ${this.orderColumn} ${this.orderType} `;
    }
    return orderByStatement;
  }

  /**
   * Creates limit statement if any and returns it
   *
   * @return {string}
   */
  getLimitStatement = () => {

    let limitStatement = '';
    if(this.limitNumber != null) {
      limitStatement = ` LIMIT ${this.limitNumber} `;
    }
    return limitStatement;
  }

  /**
   * Creates offset statement if any and returns it
   *
   * @return {string}
   */
  getOffsetStatement = () => {

    let offsetStatement = '';
    if(this.offsetNumber != null) {
      offsetStatement = ` OFFSET ${this.offsetNumber} `;
    }
    return offsetStatement;
  }

  /**
   * Creates SQL statement and returns it
   *
   * @return {string}
   */
  getQueryStatement = action => {
    if(this.selections != '*') {
      // Convert selections array to string
      this.selections = this.selections.toString(); 
    } 

    let whereStatement    = this.getWhereStatement();
    let joinStatement     = this.getJoinStatement();
    let groupByStatement  = this.getGroupByStatement();
    let havingStatement   = this.getHavingStatement();
    let orderByStatement  = this.getOrderByStatement();
    let limitStatement    = this.getLimitStatement();
    let offsetStatement   = this.getOffsetStatement();
    let queryStatement;

    switch (action) {
      case 'get':
        queryStatement = `SELECT ${this.distinctClause} ${this.selections} FROM ${this.tableName} ${joinStatement} ${whereStatement} ${groupByStatement} ${havingStatement} ${orderByStatement} ${limitStatement} ${offsetStatement}`;
        break;
      case 'insert':
        queryStatement = `INSERT INTO  ${this.tableName} SET ?`;
        break;
      case 'insertOrUpdate':
        queryStatement = `INSERT INTO  ${this.tableName} SET ? ON DUPLICATE KEY UPDATE ?`;
        break;
      case 'update':
        queryStatement = `UPDATE ${this.tableName} SET ? ${whereStatement}`;
        break;
      case 'delete':
        queryStatement = `DELETE FROM ${this.tableName}  ${whereStatement}`;
      default:
        break;
    }
    return queryStatement;
  }

  /**
   * The method for getting query. It must be the last method in method chains.
   * 
   * @return {Object} - Promise 
   */
  get = () => {
    let existsQuery = this.existsQuery;
    let fetchFirst  = this.fetchFirst;
    let hasCount    = this.hasCount;
    let findId      = this.findId;
    let connection  = this.pool !== null ? this.pool : this.connection;
    let self        = this;

    return new Promise( (resolve, reject) => {
      connection.query(this.getQueryStatement('get'), function (error, results, fields) {
        if (error) reject( error );

        // if exists() method is used
        if(existsQuery){
          resolve(results.length > 0);
        } else {
          // Only get first result
          if(fetchFirst == true || findId != null){
            resolve(self.json(results[0]));
          } if(hasCount == true){
            resolve(self.json(results[0].count));
          } else {
            resolve(self.json(results));
          }
        }
      });
      this.setPropertiesToDefault();
    });
  }

  /**
   * The method for inserting query.
   * 
   * @return {Object} - Promise 
   */
  insert = params => {
    let connection  = this.pool !== null ? this.pool : this.connection;
    let self = this;
    return new Promise( (resolve, reject) => {
      connection.query(this.getQueryStatement('insert'), params, function (error, results, fields) {
        if (error) reject( error );
        resolve(self.json(results));
      });
      this.setPropertiesToDefault();
    });
  }

  /**
   * Updates row, if not exists creates it
   * 
   * @return {Object} - Promise 
   */
  insertOrUpdate = params => {
    let connection  = this.pool !== null ? this.pool : this.connection;
    let self = this;
    return new Promise( (resolve, reject) => {
      connection.query(this.getQueryStatement('insertOrUpdate'), [params, params], function (error, results, fields) {
        if (error) reject( error );
        resolve(self.json(results));
      });
      this.setPropertiesToDefault();
    });
  }

  /**
   * Updates row
   * 
   * @return {Object} - Promise 
   */
  update = params => {
    let connection  = this.pool !== null ? this.pool : this.connection;
    let self = this;
    return new Promise( (resolve, reject) => {
      console.log(this.getQueryStatement('update'));
      connection.query(this.getQueryStatement('update'), params, function (error, results, fields) {
        if (error) reject( error );
        resolve(self.json(results));
      });
      this.setPropertiesToDefault();
    });
  }

  /**
   * Deletes row
   * 
   * @return {Object} - Promise 
   */
  delete = () => {
    let connection  = this.pool !== null ? this.pool : this.connection;
    let self = this;
    return new Promise( (resolve, reject) => {
      connection.query(this.getQueryStatement('delete'), function (error, results, fields) {
        if (error) reject( error );
        resolve(self.json(results));
      });
      this.setPropertiesToDefault();
    });
  }

  /**
   * Runs raw query 
   * 
   * @param {string} queryStatement
   * @return {Object} - Promise 
   */
  query = queryStatement => {
    let self = this;
    let connection = this.pool !== undefined ? this.pool : this.connection;
    return new Promise( (resolve, reject) => {
      connection.query(queryStatement, function (error, results, fields) {
        if (error) reject( error );
        resolve(self.json(results));
      });
      this.setPropertiesToDefault();
    });
  }

  /**
   * Sets table
   * 
   * @param {string} tableName
   * @return {Database} 
   */
  table = tableName => {
    if(tableName) {
      this.tableName = tableName;
    }
    return this;
  }

  /**
   * Sets selections
   * 
   * @param {array} args
   * @return {Database} 
   */
  select = (...args) => {
    if(args.length) {
      this.selections = args;
    }
    return this;
  }

  /**
   * Add distinct into selection
   * 
   * @return {Database} 
   */
  distinct = () => {
    this.distinctClause = ' DISTINCT ';
    return this;
  }

  /**
   * Sets where
   * 
   * @param {array} args
   * @return {Database} 
   */
  where = (...args) => {
    if(args.length) {
      this.whereArray.push(args); 
    }
    return this;
  }

  /**
   * Sets orWhere
   * 
   * @param {array} args
   * @return {Database} 
   */
  orWhere = (...args) => {
    if(args.length) {
      this.orWhereArray.push(args); 
    }
    return this;
  }

  /**
   * Sets whereBetween
   * 
   * @param {array} args
   * @return {Database} 
   */
  whereBetween = (...args) => {
    if(args.length) {
      this.whereBetweenArray.push(args); 
    }
    return this;
  }

  /**
   * Sets orWhereBetween
   * 
   * @param {array} args
   * @return {Database} 
   */
  orWhereBetween = (...args) => {
    if(args.length) {
      this.orWhereBetweenArray.push(args); 
    }
    return this;
  }

  /**
   * Sets whereNotBetween
   * 
   * @param {array} args
   * @return {Database} 
   */
  whereNotBetween = (...args) => {
    if(args.length) {
      this.whereNotBetweenArray.push(args); 
    }
    return this;
  }

  /**
   * Sets orWhereNotBetween
   * 
   * @param {array} args
   * @return {Database} 
   */
  orWhereNotBetween = (...args) => {
    if(args.length) {
      this.orWhereNotBetweenArray.push(args); 
    }
    return this;
  }

  /**
   * Sets whereIn
   * 
   * @param {array} args
   * @return {Database} 
   */
  whereIn = (...args) => {
    if(args.length) {
      this.whereInArray.push(args); 
    }
    return this;
  }

  /**
   * Sets orWhereIn
   * 
   * @param {array} args
   * @return {Database} 
   */
  orWhereIn = (...args) => {
    if(args.length) {
      this.orWhereInArray.push(args); 
    }
    return this;
  }

  /**
   * Sets notWhereIn
   * 
   * @param {array} args
   * @return {Database} 
   */
  whereNotIn = (...args) => {
    if(args.length) {
      this.whereNotInArray.push(args); 
    }
    return this;
  }

  /**
   * Sets notWhereIn
   * 
   * @param {array} args
   * @return {Database} 
   */
  orWhereNotIn = (...args) => {
    if(args.length) {
      this.orWhereNotInArray.push(args); 
    }
    return this;
  }

  /**
   * Sets whereNull
   * 
   * @param {string} args
   * @return {Database} 
   */
  whereNull = column => {
    this.whereNullArray.push(column); 
    return this;
  }

  /**
   * Sets orWhereNull
   * 
   * @param {string} args
   * @return {Database} 
   */
  orWhereNull = column => {
    this.orWhereNullArray.push(column); 
    return this;
  }

  /**
   * Sets whereNotNull
   * 
   * @param {string} args
   * @return {Database} 
   */
  whereNotNull = column => {
    this.whereNotNullArray.push(column); 
    return this;
  }

    /**
   * Sets orWhereNotNull
   * 
   * @param {string} args
   * @return {Database} 
   */
  orWhereNotNull = column => {
    this.orWhereNotNullArray.push(column); 
    return this;
  }

  /**
   * Sets find id
   * 
   * @param {number} id
   * @return {Database} 
   */
  find = id => {
    if(id) {
      this.findId = id;
    }
    return this.get();
  }

  /**
   * Sets order type and order column
   * 
   * @param {string} column
   * @param {string} orderType
   * @return {Database} 
   */
  orderby = (column, orderType) => {
    if( ['asc', 'desc', 'ASC', 'DESC'].includes(orderType) ) {
      this.orderType = orderType;
      this.orderColumn = column;
    }
    return this;
  }

  /**
   * Sets first option to true
   * 
   * @return {Object} 
   */
  first = () => {
    this.fetchFirst = true;
    return this.get();
  }

  /**
   * Sets selection to count(*)
   * 
   * @return {number} 
   */
  count = () => {
    this.hasCount = true;
    this.selections = ' COUNT(*) as count ';
    return this.get();
  }

  /**
   * Sets existsQuery option to true
   * 
   * @return {Object} 
   */
  exists = () => {
    this.existsQuery = true;
    return this.count();
  }

  /**
   * Add join arguments into joins array
   * 
   * @param {array} args
   * @return {Database} 
   */
  join = (...args) => {
    this.joins.push(args);
    return this;
  }

  /**
   * Add left join arguments into leftJoins array
   * 
   * @param {array} args
   * @return {Database} 
   */
  leftJoin = (...args) => {
    this.leftJoins.push(args);
    return this;
  }

  /**
   * Add right join arguments into rightJoins array
   * 
   * @param {array} args
   * @return {Database} 
   */
  rightJoin = (...args) => {
    this.rightJoins.push(args);
    return this;
  }

  /**
   * Sets group by column
   * 
   * @param {string} column
   * @return {Database} 
   */
  groupBy = column => {
    this.groupByColumn = column;
    return this;
  }

  /**
   * Set having condition
   * 
   * @param {array} args - Column, operation, value
   * @return {Database} 
   */
  having = (...args) => {
    if(args.length){
      this.havingArray = args;
    }
    return this;
  }

  /**
   * Set limit
   * 
   * @param {number} limitCount
   * @return {Database} 
   */
  limit = limitCount => {
    this.limitNumber = limitCount;
    return this;
  }

  /**
   * Set offset
   * 
   * @param {number} offsetCount
   * @return {Database} 
   */
  offset = offsetCount => {
    this.offsetNumber = offsetCount;
    return this;
  }

  /**
   * Set avg
   * 
   * @param {string} column
   * @param {string} name - name of AVG column whcih returned
   * @return {Object} - results
   */
  avg = (column, name=column) => {
    if( typeof this.selections == 'object') {
      this.selections.push(` AVG(${column}) AS ${name} `);
    } else {
      this.selections = [` AVG(${column}) AS ${name}`];
    }
    return this.get();
  }

  /**
   * Set max
   * 
   * @param {string} column
   * @param {string} name - name of MAX column whcih returned
   * @return {Object} - results
   */
  max = (column, name=column) => {
    if( typeof this.selections == 'object') {
      this.selections.push(` MAX(${column}) AS ${name} `);
    } else {
      this.selections = [` MAX(${column}) AS ${name}`];
    }
    return this.get();
  }

  /**
   * Set min
   * 
   * @param {string} column
   * @param {string} name - name of MIN column whcih returned
   * @return {Object} - results
   */
  min = (column, name=column) => {
    if( typeof this.selections == 'object') {
      this.selections.push(` MIN(${column}) AS ${name} `);
    } else {
      this.selections = [` MIN(${column}) AS ${name}`];
    }
    return this.get();
  }

  /**
   * Set sum
   * 
   * @param {string} column
   * @param {string} name - name of SUM column whcih returned
   * @return {Object} - results
   */
  sum = (column, name=column) => {
    if( typeof this.selections == 'object') {
      this.selections.push(` SUM(${column}) AS ${name} `);
    } else {
      this.selections = [` SUM(${column}) AS ${name}`];
    }
    return this.get();
  }

  /**
   * Set all class properties to default
   * 
   * @return {void}
   */
  setPropertiesToDefault = () => {
    this.tableName      = null;
    this.whereArray     = [];
    this.orWhereArray   = [];
    this.whereBetweenArray = [];
    this.orWhereBetweenArray = [];
    this.whereNotBetweenArray = [];
    this.orWhereNotBetweenArray = [];
    this.whereInArray = [];
    this.whereNotInArray = [];
    this.orWhereInArray = [];
    this.orWhereNotInArray = [];
    this.whereNullArray = [];
    this.orwhereNullArray = [];
    this.whereNotNullArray = [];
    this.orWhereNotNullArray = [];
    this.selections     = '*';
    this.distinctClause = '';
    this.findId         = null;
    this.orderType      = null;
    this.orderColumn    = null;
    this.fetchFirst     = false;
    this.existsQuery    = false;
    this.joins          = [];
    this.leftJoins      = [];
    this.rightJoins     = [];
    this.groupByColumn  = null;
    this.havingArray    = [];
    this.limitNumber    = null;
    this.offsetNumber   = null;
    this.hasCount       = false;
  }

  /**
   * Json Converter
   * 
   * @param {Object}
   * @return {Object}
   */
  json = (res) => {
    if(typeof res == 'object') {
      return JSON.parse(JSON.stringify(res));
    } else {
      return res;
    }
  }
}

module.exports = new Database;