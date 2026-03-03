import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grid, Paper, Typography, Box, Card, CardContent, Divider, Avatar, Tooltip } from '@mui/material';
import { 
  AccessTime as BacklogIcon, 
  Handshake as NegotiationIcon, 
  PlayCircle as ProgressIcon, 
  CheckCircle as CompletedIcon,
  AttachMoney as MoneyIcon 
} from '@mui/icons-material';

const columns = [
  { id: 'PENDING', title: 'Backlog', color: '#64748B', bgColor: '#F1F5F9', icon: <BacklogIcon /> },
  { id: 'IN_NEGOTIATION', title: 'Em Negociação', color: '#F59E0B', bgColor: '#FFFBEB', icon: <NegotiationIcon /> },
  { id: 'IN_PROGRESS', title: 'Em Andamento', color: '#3B82F6', bgColor: '#EFF6FF', icon: <ProgressIcon /> },
  { id: 'COMPLETED', title: 'Concluído', color: '#10B981', bgColor: '#ECFDF5', icon: <CompletedIcon /> },
];

const KanbanBoard = ({ projects = [], onStatusChange, onProjectClick }) => {
  const formatBRL = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  const onDragEnd = (result) => {
  const { destination, source, draggableId } = result;
  if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

  onStatusChange(draggableId, destination.droppableId);
};

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Grid container spacing={2} sx={{ overflowX: 'auto', flexWrap: 'nowrap', pb: 2 }}>
        {columns.map((col) => (
          <Grid item key={col.id} sx={{ minWidth: 300, flex: 1 }}>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 1.5, 
                borderRadius: '16px', 
                bgcolor: col.bgColor, 
                color: col.color,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                border: `1px solid ${col.color}20`
              }}
            >
              <Box sx={{ display: 'flex', color: col.color }}>
                {col.icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: col.color }}>
                {col.title}
              </Typography>
              <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 700, bgcolor: `${col.color}15`, px: 1, py: 0.5, borderRadius: '20px' }}>
                {projects.filter(p => (p.status || 'PENDING').toUpperCase() === col.id).length}
              </Typography>
            </Paper>

            <Paper 
              elevation={0} 
              sx={{ 
                p: 1.5, 
                borderRadius: '16px', 
                bgcolor: '#F8FAFC',
                minHeight: '70vh',
                border: snapshot => snapshot.isDraggingOver ? `2px dashed ${col.color}50` : '1px solid #E2E8F0' 
              }}
            >
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <Box 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    sx={{ 
                      minHeight: 600,
                      bgcolor: snapshot.isDraggingOver ? `${col.color}05` : 'transparent',
                      transition: 'background-color 0.2s ease',
                      borderRadius: '12px'
                    }}
                  >
                    {projects
                      .filter((p) => (p.status || 'PENDING').toUpperCase() === col.id)
                      .map((project, index) => (
                        <Draggable key={project.id} draggableId={String(project.id)} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onProjectClick(project)}
                              sx={{ 
                                mb: 2, 
                                borderRadius: '16px', 
                                cursor: 'pointer',
                                border: snapshot.isDragging ? `3px solid ${col.color}` : `1px solid #E2E8F0`,
                                boxShadow: snapshot.isDragging ? `0 15px 30px ${col.color}30` : '0 2px 4px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                bgcolor: '#fff',
                                position: 'relative',
                                '&:hover': {
                                  boxShadow: `0 8px 16px ${col.color}15`,
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                                  {project.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2, height: '32px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {project.description || "Descrição curta do projeto ou pedido..."}
                                </Typography>
                                
                                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: col.color }}>
                                    <MoneyIcon sx={{ fontSize: 18 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                      {formatBRL(project.budget)}
                                    </Typography>
                                  </Box>
                                  
                                  <Tooltip title={`Responsável: DWSavi`}>
                                    <Avatar sx={{ width: 28, height: 28, fontSize: '12px', bgcolor: col.color, fontWeight: 700 }}>D</Avatar>
                                  </Tooltip>
                                </Box>
                              </CardContent>
                              
                              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', bgcolor: col.color, borderRadius: '16px 0 0 16px' }} />
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </DragDropContext>
  );
};

export default KanbanBoard;