
import * as React from 'react';
import {
    styled, Button, Card, CardActions, IconButton, Collapse, Divider,
    Typography, Table, TableRow, TableCell, TableBody
} from '@mui/material'
import {
    Edit, Delete, ExpandMore
} from '@mui/icons-material'

const Expand = styled((props) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
    })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

function createData(name, dateIn, dateOut) {
    return { name, dateIn, dateOut };
}
  
const rows = [
    createData('Written 1', '8/29/22 9:00pm', '9/5/22 9:00pm'),
    createData('Written 2', '8/29/22 9:00pm', '9/5/22 9:00pm'),
    createData('Written 3', '8/29/22 9:00pm', '9/5/22 9:00pm'),
    createData('Written 4', '8/29/22 9:00pm', '9/5/22 9:00pm'),
    createData('Written 5', '8/29/22 9:00pm', '9/5/22 9:00pm'),
];

export default function QueueTopicSettings(props) {
    const { theme } = props

    const [open, setOpen] = React.useState(true);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <div className='card' style={{ display:'flex' }}>
            <Card sx={{ minWidth: '100%' }}>
                <CardActions disableSpacing>
                    <Typography sx={{ fontSize: 16, fontWeight: 'bold', ml: 2, mt: 1 }} variant="h5" gutterBottom>
                        Queue Topic Settings
                    </Typography>
                    <Expand
                        expand={open}
                        onClick={handleClick}
                        aria-expanded={open}
                        aria-label="show more"
                        sx={{ mr: 1 }}
                    >
                        <ExpandMore />
                    </Expand>
                </CardActions>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Divider></Divider>
                        <Table aria-label="topicsTable">
                            <TableBody>
                            {rows.map((row, index) => (
                                <TableRow
                                    key={row.name}
                                    style={ index % 2 ? { background : theme.palette.background.paper }:{ background : theme.palette.background.default }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontSize: '16px', fontWeight: 'bold', pl: 3.25 }}>
                                        {row.name}
                                    </TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px' }}>{row.dateIn}</TableCell>
                                    <TableCell align="left" sx={{ fontSize: '16px' }}>{row.dateOut}</TableCell>
                                    <TableCell align="right" sx={{ pr: 5 }}>
                                        <IconButton sx={{ mr: 1 }} style={{ background: "#76CDF2", color: "white" }}>
                                            <Edit />
                                        </IconButton>

                                        <IconButton style={{ background: "#F27685", color: "white" }}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                                <TableRow
                                    key='add'
                                    style={{ background : theme.palette.background.default }}
                                >
                                    <TableCell align="center" colSpan={4}>
                                        <Button sx={{ mr: 1, fontWeight: 'bold' }} style={{ background: theme.palette.primary.main, color: "white" }}>
                                            Add
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                </Collapse>
            </Card>
        </div>
    );
}
