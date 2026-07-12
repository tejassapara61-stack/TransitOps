import "./RecentTrips.css";

const trips = [
  {
    id: "TR101",
    vehicle: "Truck-01",
    driver: "Rahul Sharma",
    destination: "Ahmedabad",
    status: "Running",
    eta: "2 hrs",
  },
  {
    id: "TR102",
    vehicle: "Bus-12",
    driver: "Amit Patel",
    destination: "Surat",
    status: "Completed",
    eta: "-",
  },
  {
    id: "TR103",
    vehicle: "Van-05",
    driver: "Neha Singh",
    destination: "Vadodara",
    status: "Scheduled",
    eta: "6 hrs",
  },
  {
    id: "TR104",
    vehicle: "Truck-08",
    driver: "Vikas Kumar",
    destination: "Rajkot",
    status: "Maintenance",
    eta: "-",
  },
];

export default function RecentTrips() {
  return (
    <div className="recent-trips">

      <div className="table-header">
        <h3>Recent Trips</h3>
      </div>

      <table>

        <thead>
          <tr>
            <th>Trip ID</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Destination</th>
            <th>Status</th>
            <th>ETA</th>
          </tr>
        </thead>

        <tbody>

          {trips.map((trip) => (
            <tr key={trip.id}>

              <td>{trip.id}</td>

              <td>{trip.vehicle}</td>

              <td>{trip.driver}</td>

              <td>{trip.destination}</td>

              <td>
                <span
                  className={`status ${trip.status.toLowerCase()}`}
                >
                  {trip.status}
                </span>
              </td>

              <td>{trip.eta}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}