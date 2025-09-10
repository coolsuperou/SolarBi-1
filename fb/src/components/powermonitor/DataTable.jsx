import React from 'react';
import { Table } from 'react-bootstrap';
import './DataTable.css';

function DataTable({ data }) {
  return (
    <Table striped hover responsive variant="dark" className="tech-table">
      <thead>
        <tr>
          <th>设备ID</th>
          <th>部门车间</th>
          <th>名称</th>
          <th>电能度数</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>{row.deviceId}</td>
            <td>{row.workshop}</td>
            <td>{row.name}</td>
            <td className="energy-column">{row.energy.toFixed(2)}</td>
            <td>{row.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default DataTable;
