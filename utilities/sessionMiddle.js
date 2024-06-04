const session = require('express-session');

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
});

module.exports = sessionMiddleware;


// this my my adminn in in this i only want that left are awhich control each page and when i click on each button i want its page to be in the right side and in responsive i will add the section i need in left side and which are the pages need to render only in right side when each button clicks 

// 			<aside> 				<div class="top"> 					<div class="logo"> 						<img src="/assets/logo.svg" alt="" /> 						<h2>EVA<span class="vv">RA</span></h2> 					</div> 					<div class="close" id="close-btn"> 						<span class="material-icons-sharp">close</span> 					</div> 				</div>  				<div class="sidebar"> 					<a href="#"> 						<span class="material-icons-sharp">grid_view</span> 						<h3>Dashboard</h3> 					</a>  					<a href="/userList"> 						<span class="material-icons-sharp">person_outline</span> 						<h3>Customers</h3> 					</a>  					<a href="/adminOrder"> 						<span class="material-icons-sharp">receipt_long</span> 						<h3>Orders</h3> 					</a>  					<a href="/category"> 						<span class="material-symbols-outlined">category</span> 						<h3>Category</h3> 					</a>  					<a href="/adminProduct"> 						<span class="material-icons-sharp">inventory</span> 						<h3>Products</h3> 					</a>  					<a href="/coupon"> 						<span class="material-symbols-outlined"> 							confirmation_number 							</span> 						<h3>Coupon</h3> 					</a>  					<a href="/addProduct"> 						<span class="material-icons-sharp">add</span> 						<h3>Add Products</h3> 					</a>  					<a href="#"> 						<span class="material-icons-sharp">logout</span> 						<h3>Logout</h3> 					</a> 				</div> 			</aside> 			<!-------------- END OF LEFT ASIDE --------------> this is left side and the pages i need right is

// <!DOCTYPE html> <html lang="en"> <head>     <link rel="stylesheet" href="adminOrder.css">  </head> <body>     <h1>Admin Dashboard</h1>     <table>         <thead>             <tr>                 <th>Order ID</th>                 <th>Date</th>                 <th>Status</th>                 <th>Action</th>             </tr>         </thead>         <tbody>             <% orders.forEach(order => { %>                 <tr>                     <td><%= order.orderId %></td>                     <td><%= order.createdAt.toDateString() %></td>                     <td><%= order.status %></td>                     <td>                         <form action="/updateOrder/<%= order._id %>" method="post">                             <select name="status">                                 <option value="Pending">Pending</option>                                 <option value="Processing">Processing</option>                                 <option value="Shipped">Shipped</option>                                 <option value="Delivered">Delivered</option>                             </select>                             <button type="submit">Update Status</button>                         </form>                     </td>                 </tr>             <% }) %>         </tbody>     </table> </body> </html>  order page when the button on left irders click i want to show this in that pages right side and same the upcoming pages  